
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, User, Briefcase } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const JobApplications = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isDemoMode, demoJobs, demoApplications, updateDemoApplications, updateApplicationStatus } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>("pending");
  const [employerNotes, setEmployerNotes] = useState("");

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      setLoading(true);
      try {
        if (isDemoMode) {
          console.log("Available demo jobs:", demoJobs);
          console.log("Looking for job ID:", id);
          console.log("All applications:", demoApplications);
          
          // Find the job by ID from the demoJobs array
          const foundJob = demoJobs?.find(job => job.id === id);
          console.log("Found job:", foundJob);
          
          if (foundJob) {
            setJob(foundJob);
            
            // Find applications for this specific job
            const jobApplications = demoApplications?.filter(app => app.job_id === id) || [];
            console.log("Found applications for this job:", jobApplications);
            setApplications(jobApplications);
          } else {
            console.error("Job not found with ID:", id);
            setApplications([]);
          }
        } else {
          // Implement Supabase data fetching here if needed in the future
          console.log("Implement Supabase data fetching here");
        }
      } catch (error) {
        console.error("Error fetching job and applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [id, isDemoMode, demoJobs, demoApplications]);

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    const updatedApplications = demoApplications.map(app =>
      app.id === applicationId ? { ...app, status: newStatus, status_updated_at: new Date().toISOString() } : app
    );
    
    if (updateDemoApplications) {
      updateDemoApplications(updatedApplications);
    }
    
    // Also update the local state
    setApplications(applications.map(app =>
      app.id === applicationId ? { ...app, status: newStatus, status_updated_at: new Date().toISOString() } : app
    ));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmployerNotes(e.target.value);
  };

  const handleSaveNotes = (applicationId: string) => {
    // Update the notes in the application
    const updatedApplications = demoApplications.map(app =>
      app.id === applicationId ? { ...app, employer_notes: employerNotes } : app
    );
    
    if (updateDemoApplications) {
      updateDemoApplications(updatedApplications);
    }
    
    // Also update the local state
    setApplications(applications.map(app =>
      app.id === applicationId ? { ...app, employer_notes: employerNotes } : app
    ));
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading applications...</div>;
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
          <span className="text-red-500">Job not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <Link to="/dashboard" className="text-job-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{job?.title}</CardTitle>
          <CardDescription>Applications for this job</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span>{job?.employer?.full_name || "Employer"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Deadline: {job ? format(new Date(job.deadline), "PPP") : ""}</span>
          </div>
        </CardContent>
      </Card>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-4">
            No applications received for this job.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{application.applicant?.full_name || "Applicant Name"}</span>
                  <Badge className={statusColors[application.status || 'pending']}>
                    {statusLabels[application.status || 'pending']}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{application.applicant?.bio || "No bio available"}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Applied on: {format(new Date(application.created_at), "PPP")}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Application Message:</h4>
                  <p className="text-sm">{application.message}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Employer Notes:</h4>
                  <Textarea
                    placeholder="Add notes about the applicant"
                    value={application.employer_notes || employerNotes}
                    onChange={(e) => setEmployerNotes(e.target.value)}
                    className="mt-1"
                  />
                  <Button size="sm" className="mt-2" onClick={() => handleSaveNotes(application.id)}>
                    Save Notes
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Update Status:</h4>
                  <Select 
                    value={application.status} 
                    onValueChange={(value) => handleStatusChange(application.id, value as ApplicationStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
