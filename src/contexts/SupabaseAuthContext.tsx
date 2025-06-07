
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/lib/types";

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: "job_seeker" | "employer") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileChecked, setProfileChecked] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    console.log("Setting up auth state listener");
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: Session | null) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer profile fetch to avoid deadlocks
        if (currentSession?.user) {
          console.log("User logged in, fetching profile");
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          console.log("No user, clearing profile");
          setProfile(null);
          setProfileChecked(false);
          setIsLoading(false);
        }
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession ? "yes" : "no");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle profile-based navigation
  useEffect(() => {
    // Only redirect if we're done loading and have a user
    if (!isLoading && user) {
      console.log("Profile check complete. Profile exists:", !!profile);
      
      // Current path is profile-setup but user has profile - redirect to dashboard
      if (location.pathname === '/profile-setup' && profile) {
        console.log("User already has profile, redirecting to dashboard");
        navigate('/dashboard');
        return;
      }
      
      // User has no profile and isn't on profile-setup - redirect to profile setup
      if (!profile && location.pathname !== '/profile-setup') {
        console.log("Redirecting to profile setup");
        navigate('/profile-setup');
        return;
      }
      
      // After login, if user has profile, redirect to dashboard
      if (profile && (location.pathname === '/login' || location.pathname === '/register')) {
        console.log("User logged in and has profile, redirecting to dashboard");
        navigate('/dashboard');
      }
    }
  }, [profile, user, isLoading, navigate, location.pathname]);
  
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      // Use the mock implementation
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        setProfileChecked(true);
        return;
      }
      
      console.log("Profile data:", data);
      if (data) {
        setProfile(data as unknown as Profile);
      } else {
        // If no profile exists, set profile to null
        console.log("No profile found for user");
        setProfile(null);
      }
      
      setProfileChecked(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsLoading(false);
      setProfileChecked(true);
    }
  };
  
  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      setProfileChecked(false);
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || "Error signing in");
        setIsLoading(false);
        return { error };
      }
      
      toast.success("Signed in successfully!");
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
      setIsLoading(false);
      return { error };
    }
  };
  
  const signUp = async (email: string, password: string, role: "job_seeker" | "employer") => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        }
      });
      
      if (error) {
        toast.error(error.message || "Error creating account");
        setIsLoading(false);
        return { error };
      }
      
      toast.success("Account created successfully! Please check your email for verification.");
      setIsLoading(false);
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
      setIsLoading(false);
      return { error };
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };
  
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
      throw error;
    }
  };
  
  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
  };
  
  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
