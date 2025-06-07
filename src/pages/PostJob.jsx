import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  getFirestore,
} from "firebase/firestore";

const PostJob = () => {
  const { user, profile, refreshJobs } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (profile && profile.role !== "employer") {
      toast({
        title: "Access Denied",
        description: "Only employers can post jobs.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
  }, [user, profile, navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a job.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

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

      const jobData = {
        title: formData.title,
        description: formData.description,
        salary: formData.salary,
        location: formData.location,
        deadline: date.toISOString(),
        created_at: serverTimestamp(),
        status: "open",
        employer_id: user.uid,
        employer: {
          id: user.uid,
          full_name: profile.full_name,
          bio: profile.bio || "",
          phone: profile.phone || "",
          role: "employer",
          created_at: serverTimestamp(),
        },
      };

      const docRef = await addDoc(collection(db, "jobs"), jobData);

      await updateDoc(docRef, {
        id: docRef.id,
        employer: {
          ...jobData.employer,
          created_at: jobData.created_at,
        },
      });

      toast({
        title: "Job posted!",
        description: "Your job has been successfully posted.",
      });

      await refreshJobs();
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to post job:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to post job. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (profile && profile.role !== "employer")) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Fill out the details for your job listing
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-job-text hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </div>
                ) : (
                  "Post Job"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
