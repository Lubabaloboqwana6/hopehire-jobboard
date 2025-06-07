// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const AuthContext = createContext({
  user: null,
  profile: null,
  jobs: [],
  applications: [],
  applicationStatus: {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfileLocally: () => {},
  refreshProfile: async () => {},
  handleNewUserRegistration: () => {},
  refreshJobs: async () => {},
  refreshUserApplications: async () => {},
  submitApplication: async () => {},
  updateApplicationStatus: async () => {},
  loading: true,
  isAuthLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const refreshJobs = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const jobsSnapshot = await getDocs(
        query(collection(db, "jobs"), orderBy("created_at", "desc"))
      );
      const jobsData = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error refreshing jobs:", error);
      toast.error("Failed to refresh jobs");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  const normalizeRole = (role) => {
    if (!role) return "";
    return role.replace("_", "").toLowerCase(); // e.g. "job_seeker" -> "jobseeker"
  };

  const submitApplication = useCallback(
    async (jobId, message) => {
      if (!user || !profile) {
        toast.error("Please sign in to apply for jobs");
        return;
      }

      const role = normalizeRole(profile.role);
      if (role !== "jobseeker") {
        toast.error("Only job seekers can apply for jobs");
        return;
      }

      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (!jobDoc.exists()) {
          toast.error("Job not found");
          return;
        }

        const jobData = jobDoc.data();
        const employerId = jobData.employer_id || jobData.employerId;

        const applicationRef = await addDoc(collection(db, "applications"), {
          jobId,
          jobTitle: jobData.title,
          employerId,
          applicantId: user.uid,
          applicantName: profile.full_name || profile.name,
          message,
          status: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setApplicationStatus((prev) => ({
          ...prev,
          [jobId]: {
            status: "pending",
            message,
            createdAt: new Date(),
            applicationId: applicationRef.id,
          },
        }));

        toast.success("Application submitted successfully!");
        return { success: true, applicationId: applicationRef.id };
      } catch (error) {
        console.error("Error submitting application:", error);
        toast.error("Failed to submit application");
        return { error: error.message };
      }
    },
    [user, profile]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId, newStatus) => {
      try {
        const applicationRef = doc(db, "applications", applicationId);
        await updateDoc(applicationRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });

        setApplicationStatus((prev) => {
          const updatedStatus = { ...prev };
          for (const jobId in updatedStatus) {
            if (updatedStatus[jobId].applicationId === applicationId) {
              updatedStatus[jobId] = {
                ...updatedStatus[jobId],
                status: newStatus,
                updatedAt: new Date(),
              };
            }
          }
          return updatedStatus;
        });

        toast.success("Application status updated successfully!");
        return { success: true };
      } catch (error) {
        console.error("Error updating application status:", error);
        toast.error("Failed to update application status");
        return { error: error.message };
      }
    },
    []
  );

  const refreshUserApplications = useCallback(
    async (currentUserId, userRole) => {
      if (!currentUserId || !userRole) {
        setApplications([]);
        setApplicationStatus({});
        return;
      }

      setIsDataLoading(true);
      try {
        const role = normalizeRole(userRole);
        let q;

        if (role === "jobseeker") {
          q = query(
            collection(db, "applications"),
            where("applicantId", "==", currentUserId)
          );
        } else if (role === "employer") {
          q = query(
            collection(db, "applications"),
            where("employerId", "==", currentUserId)
          );
        } else {
          setApplications([]);
          setApplicationStatus({});
          return;
        }

        const appsSnapshot = await getDocs(q);
        const appsData = appsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        });

        setApplications(appsData);
        setApplicationStatus(
          appsData.reduce((acc, app) => {
            acc[app.jobId] = {
              status: app.status,
              message: app.message,
              createdAt: app.createdAt,
              updatedAt: app.updatedAt,
              applicationId: app.id,
            };
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error refreshing user applications:", error);
        toast.error("Failed to load your applications.");
      } finally {
        setIsDataLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    refreshJobs();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser(firebaseUser);
            setProfile(userData);
            const normalizedRole = normalizeRole(userData.role);
            if (normalizedRole) {
              await refreshUserApplications(firebaseUser.uid, normalizedRole);
            } else {
              setApplications([]);
              setApplicationStatus({});
            }
          } else {
            setUser(firebaseUser);
            setProfile(null);
            setApplications([]);
            setApplicationStatus({});
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load your profile.");
          setUser(firebaseUser);
          setProfile(null);
          setApplications([]);
          setApplicationStatus({});
        }
      } else {
        setUser(null);
        setProfile(null);
        setApplications([]);
        setApplicationStatus({});
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [refreshJobs, refreshUserApplications]);

  const signIn = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.success("Successfully signed in!");
      return { user: userCredential.user };
    } catch (error) {
      console.error("Firebase sign-in error:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Invalid email or password.";
      }
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOut = async () => {
    setIsAuthLoading(true);
    try {
      await firebaseSignOut(auth);
      toast.info("You have been signed out.");
    } catch (e) {
      console.warn("Error signing out:", e);
      toast.error("Failed to sign out.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const updateProfileLocally = (profileData) => {
    if (profile) {
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return;
    setIsDataLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
        toast.warn("Your profile data could not be found.");
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      toast.error("Could not refresh profile data.");
    } finally {
      setIsDataLoading(false);
    }
  }, [user?.uid]);

  const handleNewUserRegistration = (firebaseUser, profileData) => {
    setUser(firebaseUser);
    setProfile(profileData);
    setApplications([]);
    setApplicationStatus({});
  };

  const contextValue = {
    user,
    profile,
    jobs,
    applications,
    applicationStatus,
    loading: isAuthLoading || isDataLoading,
    isAuthLoading,
    signIn,
    signOut,
    updateProfileLocally,
    refreshProfile,
    handleNewUserRegistration,
    refreshJobs,
    refreshUserApplications,
    submitApplication,
    updateApplicationStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
