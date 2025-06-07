
// Define types that were previously imported from supabase.ts

// Types for user roles
export type UserRole = 'job_seeker' | 'employer';

// Types for application status
export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'withdrawn';

// Types for profile data
export interface Profile {
  id: string;
  created_at: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  skills: string[] | null; // Optional for all profiles
  cv_url?: string | null;
}

// Types for job listings
export interface Job {
  id: string;
  created_at: string;
  employer_id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  deadline: string;
  employer?: Profile;
}

// Types for job applications
export interface Application {
  id: string;
  created_at: string;
  job_id: string;
  applicant_id: string;
  message: string;
  status: ApplicationStatus;
  status_updated_at: string;
  employer_notes: string;
  job?: Job;
  applicant?: Profile;
}

// Placeholder function types that simulate the API calls that were in supabase.ts
export const getJob = async (id: string): Promise<{ data: Job | null; error: Error | null }> => {
  return { data: null, error: null };
};

export const getJobApplications = async (jobId: string): Promise<{ data: Application[] | null; error: Error | null }> => {
  return { data: [], error: null };
};

export const getEmployerJobs = async (employerId: string): Promise<{ data: Job[] | null; error: Error | null }> => {
  return { data: [], error: null };
};

export const getApplicantApplications = async (applicantId: string): Promise<{ data: Application[] | null; error: Error | null }> => {
  return { data: [], error: null };
};

export const updateProfile = async (userId: string, profile: any): Promise<{ error: Error | null }> => {
  return { error: null };
};

export const uploadCV = async (userId: string, file: File): Promise<{ data: { publicUrl: string } | null; error: Error | null }> => {
  return { data: { publicUrl: URL.createObjectURL(file) }, error: null };
};

export const createJob = async (jobData: any): Promise<{ error: Error | null }> => {
  return { error: null };
};

// Auth related function placeholders
export const getCurrentUser = async () => {
  return { data: { user: null }, error: null };
};

export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: Error | null }> => {
  return { data: null, error: null };
};

export const getSession = async () => {
  return { data: { session: null } };
};

export const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
  return { error: null };
};

export const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
  return { error: null };
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  return { error: null };
};

// Mock Supabase client
export const supabase = {
  auth: {
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};
