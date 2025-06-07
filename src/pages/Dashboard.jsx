import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Briefcase, FileText, Users, Calendar } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const Dashboard = () => {
  const {
    user,
    profile,
    jobs: allJobs,
    applications: userApplications,
  } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile || !allJobs) return;

    if (profile.role === "employer") {
      const employerJobs = allJobs.filter(
        (job) => job.employer_id === user.uid
      );
      setJobs(employerJobs);
      setApplications(userApplications);
    } else if (profile.role === "job_seeker") {
      setJobs(allJobs);
      setApplications(userApplications);
    }
  }, [user, profile, allJobs, userApplications]);

  useEffect(() => {
    const loadNotes = async () => {
      if (!user || profile.role !== "job_seeker") return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().interviewNotes) {
        setNotes(docSnap.data().interviewNotes);
      }
    };
    loadNotes();
  }, [user, profile]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { interviewNotes: notes });
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
          <p className="mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.full_name}</h1>

      {/* Profile Card */}
      <div className="mb-8">
        <Card>
          <CardHeader className="bg-job-background">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Your personal and professional information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">
                  {profile.role === "job_seeker" ? "Job Seeker" : "Employer"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              )}
              {profile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p>{profile.bio}</p>
                </div>
              )}
              {profile.role === "job_seeker" &&
                profile.skills &&
                profile.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              <Button
                variant="outline"
                onClick={() => navigate("/edit-profile")}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.role === "employer" ? (
            <Card>
              <CardHeader className="bg-job-background">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Job Seekers
                </CardTitle>
                <CardDescription>
                  Browse qualified job seekers for your company
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  {jobSeekers.length} qualified candidates available
                </p>
                <Button
                  onClick={() => navigate("/post-job")}
                  className="w-full"
                >
                  Browse Candidates
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-job-background">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Job Opportunities
                </CardTitle>
                <CardDescription>
                  Find jobs that match your skills
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  {allJobs.length} open positions available
                </p>
                <Button onClick={() => navigate("/jobs")} className="w-full">
                  Browse All Jobs
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader className="bg-job-background">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {profile.role === "job_seeker"
                    ? "Your Applications"
                    : "Recent Applications"}
                </CardTitle>
                <Badge className="bg-job-primary">{applications.length}</Badge>
              </div>
              <CardDescription>
                {profile.role === "job_seeker"
                  ? "Jobs you have applied for"
                  : "Candidates who applied to your jobs"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {applications.length > 0 ? (
                  applications.slice(0, 5).map((application) => (
                    <div key={application.id} className="border rounded-md p-3">
                      {profile.role === "job_seeker" ? (
                        <>
                          <div className="font-medium">
                            {application.jobTitle}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: {application.status}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">
                            {application.applicantName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.jobTitle}
                          </div>
                          <div className="mt-2">
                            <label className="text-xs text-muted-foreground block mb-1">
                              Status:
                            </label>
                            <select
                              value={application.status}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  application.id,
                                  e.target.value
                                )
                              }
                              className="border rounded px-2 py-1 text-sm w-full"
                            >
                              <option value="pending">Pending</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview">Interview</option>
                              <option value="rejected">Rejected</option>
                              <option value="accepted">Accepted</option>
                              <option value="got the job">Got the Job</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {profile.role === "job_seeker"
                      ? "You haven't applied to any jobs yet."
                      : "No applications received yet."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employer: Job Listings */}
          {profile.role === "employer" && (
            <Card>
              <CardHeader className="bg-job-background">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Your Job Listings
                </CardTitle>
                <CardDescription>Jobs you have posted</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <div key={job.id} className="border rounded-md p-3">
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground flex justify-between mt-1">
                          <Badge variant="outline" className="text-xs">
                            {
                              userApplications.filter((a) => a.jobId === job.id)
                                .length
                            }{" "}
                            applications
                          </Badge>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-job-primary text-xs"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't posted any jobs yet.
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => navigate("/post-job")}
                  className="w-full mt-4"
                >
                  Post a New Job
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Job Seeker: Upcoming Interviews */}
          {profile.role === "job_seeker" && (
            <>
              <Card>
                <CardHeader className="bg-job-background">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Upcoming Interviews
                  </CardTitle>
                  <CardDescription>
                    Interview invitations from employers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {applications.filter((app) => app.status === "interview")
                      .length > 0 ? (
                      applications
                        .filter((app) => app.status === "interview")
                        .map((application) => (
                          <div
                            key={application.id}
                            className="border rounded-md p-3"
                          >
                            <div className="font-medium">
                              {application.jobTitle}
                            </div>
                            <div className="text-sm">
                              {application.employerName}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No interviews scheduled yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interview Notes */}
              <Card>
                <CardHeader className="bg-job-background">
                  <CardTitle className="text-lg">
                    Interview Preparation Notes
                  </CardTitle>
                  <CardDescription>
                    Write down your thoughts or reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Add any preparation notes here..."
                  />
                  <Button
                    className="mt-2"
                    onClick={handleSaveNotes}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Notes"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
