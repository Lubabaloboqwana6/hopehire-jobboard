
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const JobApplicationForm = ({ jobId, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile, demoApplications, demoJobs, updateDemoApplications } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the current user has already applied for this job
  const hasApplied = user && demoApplications.some(
    app => app.job_id === jobId && app.applicant_id === user.id && 
    ['pending', 'reviewing', 'interview', 'offered'].includes(app.status)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      navigate("/login");
      return;
    }

    // Prevent re-applying if already applied
    if (hasApplied) {
      toast({
        title: "Application Exists",
        description: "You have already applied for this job.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simulate application submission in demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentDate = new Date().toISOString();
      
      // Find the job data
      const jobInfo = demoJobs.find(job => job.id === jobId);
      
      if (!jobInfo) {
        throw new Error("Job not found");
      }
      
      // Create a new demo application
      const newApplication = {
        id: `app-${Date.now()}`,
        created_at: currentDate,
        job_id: jobId,
        applicant_id: user.id,
        message,
        status: 'pending',
        status_updated_at: currentDate,
        employer_notes: '',
        job: jobInfo,
        // Ensure all required properties are provided for the applicant
        applicant: {
          ...profile,
          role: 'job_seeker',
          phone: profile.phone || '',
          bio: profile.bio || '',
          skills: profile.skills || [],
          cv_url: profile.cv_url || ''
        }
      };
      
      console.log("Creating new application:", newApplication);
      
      // Update the applications array with the new application
      updateDemoApplications([...demoApplications, newApplication]);
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Please sign in to apply for this job.</p>
          <Button className="w-full mt-4" onClick={() => navigate("/login")}>
            Sign In to Apply
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (profile?.role === "employer") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">You are signed in as an employer and cannot apply for jobs.</p>
        </CardContent>
      </Card>
    );
  }

  if (hasApplied) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-job-primary font-medium">You have already applied for this position.</p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            You can check the status of your application in your dashboard.
          </p>
          <Button 
            className="w-full mt-4" 
            onClick={() => navigate("/dashboard")}
          >
            View My Applications
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this job</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="message">Cover Letter / Message</Label>
            <Textarea
              id="message"
              placeholder="Tell the employer why you're a good fit for this position..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobApplicationForm;
