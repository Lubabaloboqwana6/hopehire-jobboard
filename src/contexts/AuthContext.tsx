import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ApplicationStatus as AppStatus } from '@/lib/types';

export interface Profile {
  id: string;
  full_name: string;
  role: 'job_seeker' | 'employer';
  phone?: string;
  bio?: string;
  skills?: string[];
  cv_url?: string;
  created_at: string;
  user_id: string;
  updated_at?: string;
}

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

export interface Application {
  id: string;
  created_at: string;
  job_id: string;
  applicant_id: string;
  message: string;
  status: AppStatus;
  status_updated_at: string;
  employer_notes: string;
  job?: Job;
  applicant?: Profile;
}

export type { AppStatus as ApplicationStatus };

export interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isDemoMode: boolean;
  demoJobs: Job[];
  demoApplications: Application[];
  mockUsers: Record<string, Profile>;
  updateDemoApplications: (applications: Application[]) => void;
  updateApplicationStatus: (applicationId: string, status: AppStatus, notes: string) => Promise<void>;
  addDemoJob: (job: Job) => void;
  editJob: (jobId: string, updatedJob: Partial<Job>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
  isDemoMode: true,
  demoJobs: [],
  demoApplications: [],
  mockUsers: {},
  updateDemoApplications: () => {},
  updateApplicationStatus: async () => {},
  addDemoJob: () => {},
  editJob: async () => {},
  deleteJob: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers: Record<string, Profile> = {
  'jobseeker@example.com': {
    id: 'js-001',
    full_name: 'John Applicant',
    role: 'job_seeker',
    phone: '555-123-4567',
    bio: 'Experienced web developer looking for new opportunities.',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    cv_url: 'https://example.com/cv.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'js-001'
  },
  'employer@example.com': {
    id: 'emp-001',
    full_name: 'Tech Company Inc.',
    role: 'employer',
    phone: '555-987-6543',
    bio: 'Innovative tech company with a focus on web development.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'emp-001',
    skills: []
  }
};

const initialDemoJobs: Job[] = [
  {
    id: 'job-001',
    created_at: new Date().toISOString(),
    employer_id: 'emp-001',
    title: 'Frontend Developer',
    description: 'We are looking for a skilled frontend developer with experience in React and TypeScript.',
    salary: '$80,000 - $100,000',
    location: 'Remote',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employer: mockUsers['employer@example.com']
  },
  {
    id: 'job-002',
    created_at: new Date().toISOString(),
    employer_id: 'emp-001',
    title: 'Backend Developer',
    description: 'Join our team as a backend developer working with Node.js and PostgreSQL.',
    salary: '$90,000 - $110,000',
    location: 'San Francisco, CA',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    employer: mockUsers['employer@example.com']
  }
];

const initialDemoApplications: Application[] = [];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demoJobs, setDemoJobs] = useState<Job[]>(initialDemoJobs);
  const [demoApplications, setDemoApplications] = useState<Application[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      if (parsedUser.email === 'jobseeker@example.com') {
        setProfile(mockUsers['jobseeker@example.com']);
      } else if (parsedUser.email === 'employer@example.com') {
        setProfile(mockUsers['employer@example.com']);
      }
    }
    
    localStorage.setItem('demoApplications', JSON.stringify(initialDemoApplications));
    setDemoApplications(initialDemoApplications);
    
    localStorage.setItem('demoJobs', JSON.stringify(initialDemoJobs));
    setDemoJobs(initialDemoJobs);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting to sign in with:", email);
    
    let userProfile = null;
    
    if (email === 'jobseeker@example.com') {
      userProfile = mockUsers['jobseeker@example.com'];
    } else if (email === 'employer@example.com') {
      userProfile = mockUsers['employer@example.com'];
    }
    
    if (userProfile && password === "password123") {
      const userData = { id: userProfile.id, email };
      
      localStorage.setItem('demoUser', JSON.stringify(userData));
      
      setUser(userData);
      setProfile(userProfile);
      
      toast.success("Logged in successfully!");
      return { error: null };
    }
    
    return { error: new Error('Invalid credentials') };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('demoUser');
    toast.success("Logged out successfully!");
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    
    if (mockUsers[user.email]) {
      mockUsers[user.email] = {
        ...mockUsers[user.email],
        ...data
      };
    }
    
    setProfile(prev => prev ? { ...prev, ...data } : null);
    
    toast.success("Profile updated successfully!");
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    if (mockUsers[user.email]) {
      setProfile(mockUsers[user.email]);
    }
  };

  const updateDemoApplications = (applications: Application[]) => {
    console.log("Updating demo applications:", applications);
    setDemoApplications(applications);
    localStorage.setItem('demoApplications', JSON.stringify(applications));
  };

  const updateApplicationStatus = async (applicationId: string, status: AppStatus, notes: string) => {
    const updatedApplications = demoApplications.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: status,
          status_updated_at: new Date().toISOString(),
          employer_notes: notes
        };
      }
      return app;
    });
    
    updateDemoApplications(updatedApplications);
    toast.success("Application status updated!");
  };

  const addDemoJob = (job: Job) => {
    const newJobs = [...demoJobs, job];
    setDemoJobs(newJobs);
    localStorage.setItem('demoJobs', JSON.stringify(newJobs));
  };

  const editJob = async (jobId: string, updatedJob: Partial<Job>) => {
    try {
      const updatedJobs = demoJobs.map(job => {
        if (job.id === jobId) {
          return { ...job, ...updatedJob, updated_at: new Date().toISOString() };
        }
        return job;
      });
      
      setDemoJobs(updatedJobs);
      localStorage.setItem('demoJobs', JSON.stringify(updatedJobs));
      toast.success("Job updated successfully!");
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
      return Promise.reject(error);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const filteredJobs = demoJobs.filter(job => job.id !== jobId);
      setDemoJobs(filteredJobs);
      localStorage.setItem('demoJobs', JSON.stringify(filteredJobs));
      
      const filteredApplications = demoApplications.filter(app => app.job_id !== jobId);
      setDemoApplications(filteredApplications);
      localStorage.setItem('demoApplications', JSON.stringify(filteredApplications));
      
      toast.success("Job deleted successfully!");
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
      return Promise.reject(error);
    }
  };

  const value = {
    user,
    profile,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    isDemoMode: true,
    demoJobs,
    demoApplications,
    mockUsers,
    updateDemoApplications,
    updateApplicationStatus,
    addDemoJob,
    editJob,
    deleteJob
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
