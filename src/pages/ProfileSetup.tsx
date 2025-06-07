
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/lib/types";

const ProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    role: "job_seeker" as UserRole,
    phone: "",
    bio: "",
    skills: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProfileSetup: User:", user?.id, "Profile:", profile ? "exists" : "none");
    if (profile) {
      console.log("User already has a profile, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      console.log("Creating profile for user:", user.id);
      
      const profileData = {
        id: user.id,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone || null,
        bio: formData.bio || null,
        skills: formData.skills ? formData.skills.split(",").map(skill => skill.trim()) : null,
      };

      // In demo mode, simulate a delay and profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let cvUrl = '';
      if (cvFile && formData.role === "job_seeker") {
        // Create an object URL for the demo mode
        cvUrl = URL.createObjectURL(cvFile);
      }
      
      await refreshProfile();
      
      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
      console.error("Profile setup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Please sign in to set up your profile.</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us more about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup 
                value={formData.role} 
                onValueChange={handleRoleChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="job_seeker" id="job_seeker" />
                  <Label htmlFor="job_seeker" className="cursor-pointer">Job Seeker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employer" id="employer" />
                  <Label htmlFor="employer" className="cursor-pointer">Employer</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            {formData.role === "job_seeker" && (
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder="React, JavaScript, Tailwind CSS"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {formData.role === "job_seeker" && (
              <div className="space-y-2">
                <Label htmlFor="cv">Upload CV (PDF, optional)</Label>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
