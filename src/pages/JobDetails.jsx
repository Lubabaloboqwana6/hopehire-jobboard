// src/pages/JobDetails.jsx
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Your existing AuthContext
import { db } from "@/firebase"; // Your existing Firebase setup
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { format as formatDateFnsOriginal, formatDistanceToNow } from "date-fns"; // Renamed to avoid conflict
import {
  Loader2,
  Briefcase,
  MapPin,
  CalendarClock,
  DollarSign,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  LogIn,
  Building,
  Users,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"; // Your toast hook

const JobDetails = () => {
  const { id: jobIdFromParams } = useParams();
  const location = useLocation();
  const { user, profile, loading: authContextLoading, applicationStatus, submitApplication, refreshUserApplications } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(true);
  const [employer, setEmployer] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getEmployerIdFromJob = (jobData) => {
    return jobData?.employer_id || jobData?.employerId || null;
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobIdFromParams) {
        toast({
          variant: "destructive",
          title: "Invalid Job ID",
          description: "No job ID provided.",
        });
        navigate("/jobs");
        setLoadingJobDetails(false);
        return;
      }
      setLoadingJobDetails(true);
      if (job?.id !== jobIdFromParams) {
        setJob(null);
        setEmployer(null);
      }

      try {
        let jobDataToSet = null;
        let employerDataFromStateOrEmbed = null;
        if (
          location.state?.jobData &&
          location.state.jobData.id === jobIdFromParams
        ) {
          jobDataToSet = location.state.jobData;
          if (
            jobDataToSet.employer &&
            typeof jobDataToSet.employer === "object" &&
            Object.keys(jobDataToSet.employer).length > 0
          ) {
            employerDataFromStateOrEmbed = jobDataToSet.employer;
          }
        } else {
          const jobDocRef = doc(db, "jobs", jobIdFromParams);
          const jobDocSnap = await getDoc(jobDocRef);
          if (!jobDocSnap.exists())
            throw new Error("Job not found. It may have been removed.");
          jobDataToSet = { id: jobDocSnap.id, ...jobDocSnap.data() };
          if (
            jobDataToSet.employer &&
            typeof jobDataToSet.employer === "object" &&
            Object.keys(jobDataToSet.employer).length > 0
          ) {
            employerDataFromStateOrEmbed = jobDataToSet.employer;
          }
        }
        setJob(jobDataToSet);

        const employerIdForFetch = getEmployerIdFromJob(jobDataToSet);
        if (employerDataFromStateOrEmbed) {
          setEmployer(employerDataFromStateOrEmbed);
        } else if (employerIdForFetch) {
          try {
            const employerDocRef = doc(db, "users", employerIdForFetch);
            const employerDocSnap = await getDoc(employerDocRef);
            if (employerDocSnap.exists()) {
              setEmployer({
                id: employerDocSnap.id,
                ...employerDocSnap.data(),
              });
            } else {
              setEmployer(null);
            }
          } catch (empError) {
            if (empError.code !== "permission-denied")
              console.error("Error fetching employer:", empError);
            setEmployer(null);
          }
        } else {
          setEmployer(null);
        }

        // Refresh applications if user is signed in
        if (user?.uid && jobDataToSet?.id) {
          await refreshUserApplications(user.uid, profile?.role || "jobseeker");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Loading Job",
          description: error.message || "Failed to load job details.",
        });
        setJob(null);
        setEmployer(null);
      } finally {
        setLoadingJobDetails(false);
      }
    };
    if (jobIdFromParams) fetchJobDetails();
  }, [jobIdFromParams, user, location.state, navigate, toast, refreshUserApplications, profile?.role]);

  // Get application status from AuthContext
  const jobApplicationStatus = applicationStatus?.[jobIdFromParams] || null;
  const hasApplied = jobApplicationStatus !== null;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (profile.role !== "jobseeker" && profile.role !== "job_seeker") {
      toast({
        title: "Not Allowed",
        description: "Only job seekers can apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    if (hasApplied) {
      toast({
        title: "Already Applied",
        description: "You have already applied for this job.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitApplication(jobIdFromParams, applicationMessage);
      if (result.success) {
        setShowApplicationForm(false);
        setApplicationMessage("");
        toast({
          title: "Application Submitted",
          description: "Your application has been submitted successfully!",
        });
        // Refresh applications to update status
        await refreshUserApplications(user.uid, profile.role);
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    try {
      if (dateValue instanceof Date && !isNaN(dateValue)) return dateValue;
      if (typeof dateValue.toDate === "function") return dateValue.toDate();
      if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
      const parsedDate = new Date(dateValue);
      return isNaN(parsedDate) ? null : parsedDate;
    } catch (e) {
      return null;
    }
  };

  const formatDateReference = (dateInput, formatString = "MMM d, yyyy") => {
    const date = parseDate(dateInput);
    if (!date) return "Not specified";
    try {
      return formatDateFnsOriginal(date, formatString);
    } catch (error) {
      return "Invalid date";
    }
  };

  const deadlineForExpiryCheck = parseDate(job?.deadline || job?.deadline_date);
  const isExpired = deadlineForExpiryCheck
    ? new Date() > deadlineForExpiryCheck
    : false;

  if (authContextLoading || loadingJobDetails) {
    return (
      <div className="container mx-auto py-16 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-lg text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    // Your more detailed "Job Not Found" component can go here if you prefer
    return (
      <div className="container mx-auto py-16 flex justify-center items-center min-h-[60vh] text-center">
        <div>
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This job posting could not be found. It might have been removed or
            the link is incorrect.
          </p>
          <Button onClick={() => navigate("/jobs")} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentUserEmployerOfJob =
    user && user.uid === getEmployerIdFromJob(job);
  const employerDisplayName =
    employer?.full_name ||
    employer?.companyName ||
    job?.companyName ||
    "The Company";
  const employerBio = employer?.bio || "No company description available.";
  const deadlineFormatted = formatDateReference(
    job?.deadline || job?.deadline_date
  );
  const createdAtFormatted = formatDateReference(job?.created_at);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          to="/jobs"
          className="text-primary hover:underline flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <Card className="shadow-md border-2 border-muted overflow-hidden">
            <CardHeader className="bg-muted border-b pb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-foreground">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base flex items-center text-muted-foreground">
                    <Building className="mr-2 h-4 w-4" />
                    {employerDisplayName}
                  </CardDescription>
                </div>
                {isCurrentUserEmployerOfJob && (
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/jobs/${job.id}/applications`)
                    }
                    variant="outline"
                    className="flex items-center"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                )}
              </div>
              {/* Display isExpired badge in the header */}
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {job.jobType && (
                  <Badge variant="secondary">{job.jobType}</Badge>
                )}
                {job.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </Badge>
                )}
                {job.isRemote && <Badge variant="info">Remote</Badge>}
                {isExpired && <Badge variant="destructive">Expired</Badge>}
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-muted/10 rounded-lg p-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {job.location || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium text-foreground">
                      {job.salary || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p
                      className={`font-medium text-foreground ${
                        isExpired ? "text-destructive" : ""
                      }`}
                    >
                      {deadlineFormatted}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium text-foreground">
                      {createdAtFormatted}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Job Description
                </h3>
                <div className="whitespace-pre-wrap text-base leading-relaxed bg-card p-6 rounded-lg border shadow-sm text-muted-foreground">
                  {job.description || "No description provided."}
                </div>
              </div>

              {job.requirements && (
                <div className="space-y-4 mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold text-foreground">
                    Key Requirements
                  </h3>
                  <div className="whitespace-pre-wrap text-base leading-relaxed bg-card p-6 rounded-lg border shadow-sm text-muted-foreground">
                    {typeof job.requirements === "string"
                      ? job.requirements.replace(/\n/g, "<br />")
                      : "Not specified"}
                  </div>
                </div>
              )}
              {job.benefits && (
                <div className="space-y-4 mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold text-foreground">
                    Benefits
                  </h3>
                  <div className="whitespace-pre-wrap text-base leading-relaxed bg-card p-6 rounded-lg border shadow-sm text-muted-foreground">
                    {typeof job.benefits === "string"
                      ? job.benefits.replace(/\n/g, "<br />")
                      : "Not specified"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          {showApplicationForm ? (
            <Card className="shadow-md border-2 border-muted sticky top-24">
              <CardHeader className="bg-muted border-b">
                <CardTitle className="text-xl text-foreground">
                  Apply for this position
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Submit your application to {employerDisplayName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="applicationMessage"
                      className="block text-sm font-medium mb-2 text-foreground"
                    >
                      Message to employer
                    </label>
                    <Textarea
                      id="applicationMessage"
                      placeholder="Briefly explain why you're a good fit for this role..."
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/2"
                      onClick={() => setShowApplicationForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-2 border-muted sticky top-24">
              <CardHeader className="bg-muted border-b">
                <CardTitle className="text-xl text-foreground">
                  About the Company
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {employerDisplayName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {employerBio}
                </p>

                {!user ? (
                  <div className="text-center bg-muted/30 p-4 rounded-md space-y-4">
                    <p className="text-muted-foreground">
                      Sign in to apply for this job
                    </p>
                    <Button
                      onClick={() =>
                        navigate("/login", {
                          state: { from: location.pathname },
                        })
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </Button>
                  </div>
                ) : isCurrentUserEmployerOfJob ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/dashboard/jobs/edit/${job.id}`}>
                      Manage Your Job Posting
                    </Link>
                  </Button>
                ) : profile?.role === "employer" ? (
                  <div className="text-center bg-muted/30 p-4 rounded-md">
                    <Badge className="mb-2">Employer Account</Badge>
                    <p className="text-muted-foreground">
                      You cannot apply for jobs with an employer account.
                    </p>
                  </div>
                ) : profile?.role === "jobseeker" ||
                  profile?.role === "job_seeker" ? (
                  hasApplied ? (
                    <div className="text-center bg-muted/30 p-4 rounded-md">
                      <Badge className="mb-2 bg-green-600 hover:bg-green-600 text-white">
                        Applied
                      </Badge>
                      <p className="text-muted-foreground">
                        You have already applied for this job.
                      </p>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => navigate("/applications")}
                        variant="outline"
                      >
                        View Your Applications
                      </Button>
                    </div>
                  ) : isExpired ? (
                    <Button className="w-full" disabled>
                      Applications Closed
                    </Button>
                  ) : (
                    <Button
                      className="w-full py-6 text-base rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                      onClick={() => setShowApplicationForm(true)}
                    >
                      Apply Now
                    </Button>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center w-full">
                    Please complete your profile to apply.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
