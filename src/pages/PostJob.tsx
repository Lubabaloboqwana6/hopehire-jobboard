
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

const PostJob = () => {
  const { user, profile, addDemoJob, isDemoMode = true } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (profile.role !== "employer") {
      toast({
        title: "Permission denied",
        description: "Only employers can post jobs.",
        variant: "destructive",
      });
      return;
    }
    if (!date) {
      toast({
        title: "Missing deadline",
        description: "Please select an application deadline.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log("Adding demo job...");
      // Create a new job for demo mode
      const newJob = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        employer_id: user.id,
        title: formData.title,
        description: formData.description,
        salary: formData.salary,
        location: formData.location,
        deadline: date.toISOString(),
        status: "open",
        employer: {
          id: profile.id,
          full_name: profile.full_name,
          bio: profile.bio,
          role: profile.role,
          phone: profile.phone,
          skills: profile.skills,
          user_id: profile.user_id || profile.id,
          created_at: profile.created_at || new Date().toISOString()
        }
      };
      
      // Add the job to demo jobs
      addDemoJob(newJob);
      
      // Show success toast
      toast({
        title: "Job posted!",
        description: "Your job has been successfully posted (demo mode).",
      });
      
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Failed to post job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is logged in and is an employer
  if (!user) {
    navigate("/login");
    return null;
  }

  if (profile && profile.role !== "employer") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>Fill out the details for your job listing</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
              You are in demo mode. Job postings will be simulated and won't be saved to a database.
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Frontend Developer"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the job responsibilities, requirements, etc."
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  name="salary"
                  placeholder="e.g. $60,000 - $80,000"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. New York, Remote"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select deadline</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full bg-job-primary hover:bg-job-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
