
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Job, Application } from "@/lib/types";
import { CalendarIcon, Briefcase, Users, FileText, Search, Edit, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 border-blue-200",
  interview: "bg-purple-100 text-purple-800 border-purple-200",
  offered: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  withdrawn: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusLabels = {
  pending: "Pending",
  reviewing: "Under Review",
  interview: "Interview",
  offered: "Job Offered",
  rejected: "Rejected",
  withdrawn: "Withdrawn"
};

// Adding missing functions
const getEmployerJobs = async (employerId: string) => {
  // This is just a placeholder. In a real app, this would call Supabase
  console.log("Getting jobs for employer:", employerId);
  return { data: [], error: null };
};

const getApplicantApplications = async (applicantId: string) => {
  // This is just a placeholder. In a real app, this would call Supabase
  console.log("Getting applications for applicant:", applicantId);
  return { data: [], error: null };
};

const Dashboard = () => {
  const { user, profile, isDemoMode, demoJobs, demoApplications } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile setup if no profile exists
    if (user && !profile) {
      navigate("/profile-setup");
      return;
    }

    // Fetch data based on user role
    const fetchData = async () => {
      if (!user || !profile) return;

      setLoading(true);
      try {
        if (isDemoMode) {
          // Use demo data
          if (profile.role === "employer") {
            // Convert types before setting state
            setJobs(demoJobs as unknown as Job[]);
            // Get applications for the employer's jobs
            const employerJobIds = demoJobs.filter(job => job.employer_id === user.id).map(job => job.id);
            const employerApplications = demoApplications.filter(app => employerJobIds.includes(app.job_id));
            setApplications(employerApplications as unknown as Application[]);
          } else if (profile.role === "job_seeker") {
            // Get job seeker's applications
            const jobSeekerApplications = demoApplications.filter(app => app.applicant_id === user.id);
            setApplications(jobSeekerApplications as unknown as Application[]);
          }
          setLoading(false);
          return;
        }

        // Real Supabase implementation
        if (profile.role === "employer") {
          const { data, error } = await getEmployerJobs(user.id);
          if (error) throw error;
          setJobs(data || []);

          // Would need to aggregate applications for all jobs here
        } else if (profile.role === "job_seeker") {
          const { data, error } = await getApplicantApplications(user.id);
          if (error) throw error;
          setApplications(data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && profile) {
      fetchData();
    }
  }, [user, profile, navigate, isDemoMode, demoJobs, demoApplications]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading && !profile) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-job-text">
          {profile?.role === "employer" ? "Employer Dashboard" : "Job Seeker Dashboard"}
        </h1>
        {profile?.role === "employer" ? (
          <Button onClick={() => navigate("/post-job")}>
            <Briefcase className="mr-2 h-4 w-4" /> Post a Job
          </Button>
        ) : (
          <Button onClick={() => navigate("/jobs")}>
            <Search className="mr-2 h-4 w-4" /> Browse Jobs
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate("/edit-profile")}>
            <Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p>{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="capitalize">{profile?.role?.replace("_", " ")}</p>
              </div>
              {profile?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{profile.phone}</p>
                </div>
              )}
            </div>
            
            {profile?.bio && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Bio</p>
                <p>{profile.bio}</p>
              </div>
            )}
            
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-job-muted text-job-text px-2 py-1 rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile?.cv_url && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">CV</p>
                <a 
                  href={profile.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-job-primary hover:underline flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View CV
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employer Dashboard */}
      {profile?.role === "employer" && (
        <Tabs defaultValue="my-jobs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="my-jobs">My Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="browse-talent">Browse Talent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-jobs">
            <Card>
              <CardHeader>
                <CardTitle>My Job Postings</CardTitle>
                <CardDescription>Jobs you have posted</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading your jobs...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                    <Button onClick={() => navigate("/post-job")}>Post Your First Job</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => {
                      // Count applications for this job
                      const applicationsCount = applications.filter(app => app.job_id === job.id).length;
                      
                      return (
                        <div key={job.id} className="border rounded-lg p-4 hover:bg-job-background transition-colors">
                          <h3 className="font-semibold text-lg text-job-text">{job.title}</h3>
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>
                              Deadline: {format(new Date(job.deadline), "PPP")}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2">{job.description}</p>
                          <div className="mt-4 flex justify-between items-center">
                            <Link 
                              to={`/jobs/${job.id}`} 
                              className="text-job-primary hover:underline"
                            >
                              View Details
                            </Link>
                            <Link 
                              to={`/jobs/${job.id}/applications`} 
                              className="flex items-center text-job-primary hover:underline"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              View Applications ({applicationsCount})
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications Received</CardTitle>
                <CardDescription>Job seekers who have applied to your posts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You haven't received any applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{application.applicant?.full_name || "Applicant"}</h3>
                            <p className="text-sm text-muted-foreground">Applied for: {application.job?.title || "Job"}</p>
                          </div>
                          <div className="flex items-center">
                            <Badge className={statusColors[application.status || 'pending']}>
                              {statusLabels[application.status || 'pending']}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(application.created_at), "PPP")}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">"{application.message.substring(0, 100)}..."</p>
                        <div className="mt-3 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/jobs/${application.job_id}/applications`)}
                          >
                            View Details
                          </Button>
                          <Button size="sm">Contact</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="browse-talent">
            <Card>
              <CardHeader>
                <CardTitle>Browse Talent</CardTitle>
                <CardDescription>Find qualified candidates for your positions</CardDescription>
              </CardHeader>
              <CardContent>
                {isDemoMode ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold">Demo Job Seeker</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">JavaScript</span>
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">React</span>
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">TypeScript</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        Experienced web developer looking for new opportunities
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold">Jane Applicant</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">Node.js</span>
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">PostgreSQL</span>
                        <span className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">MongoDB</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        Backend developer with 5 years experience in Node.js and databases
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Talent browsing feature coming soon.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connect to Supabase for full functionality.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Job Seeker Dashboard */}
      {profile?.role === "job_seeker" && (
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="saved-jobs">Saved Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Jobs you have applied for</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading your applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                    <Button onClick={() => navigate("/jobs")}>Browse Available Jobs</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-job-background transition-colors">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg text-job-text">
                            {application.job?.title || "Job Title Unavailable"}
                          </h3>
                          <Badge className={statusColors[application.status || 'pending']}>
                            {statusLabels[application.status || 'pending']}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>Applied on: {format(new Date(application.created_at), "PPP")}</span>
                        </div>
                        
                        {application.status_updated_at && (
                          <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Status updated: {format(new Date(application.status_updated_at), "PPP")}</span>
                          </div>
                        )}
                        
                        <p className="mt-3 text-sm text-muted-foreground">Your message:</p>
                        <p className="mt-1 line-clamp-2">{application.message}</p>
                        
                        {application.employer_notes && (application.status === 'interview' || application.status === 'reviewing') && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-medium">Feedback from employer:</p>
                            <p className="text-sm mt-1">{application.employer_notes}</p>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Link 
                            to={`/jobs/${application.job_id}`} 
                            className="text-job-primary hover:underline"
                          >
                            View Job Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved-jobs">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
                <CardDescription>Jobs you have bookmarked for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Saved jobs feature coming soon.</p>
                  <Button onClick={() => navigate("/jobs")} className="mt-4">
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;
