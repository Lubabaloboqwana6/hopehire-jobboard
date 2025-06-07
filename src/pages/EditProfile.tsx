
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";

const EditProfile = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    skills: ""
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!profile) {
      navigate("/profile-setup");
      return;
    }

    // Pre-fill form with existing profile data
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      skills: profile.skills ? profile.skills.join(", ") : ""
    });
  }, [user, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      setIsSubmitting(true);
      
      const profileData: any = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        bio: formData.bio || null
      };
      
      // Only update skills for job seekers
      if (profile.role === "job_seeker") {
        profileData.skills = formData.skills ? formData.skills.split(",").map((skill: string) => skill.trim()) : null;
      }

      // Handle CV for job seekers
      if (cvFile && profile.role === "job_seeker") {
        // In demo mode, just create a local URL
        profileData.cv_url = URL.createObjectURL(cvFile);
      }

      // Update profile in mock data
      await updateProfile(profileData);
      
      // Refresh profile
      await refreshProfile();
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
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
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            {profile.role === "job_seeker" && (
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

            {profile.role === "job_seeker" && (
              <div className="space-y-2">
                <Label htmlFor="cv">Upload New CV (PDF, optional)</Label>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {profile.cv_url && (
                  <div className="mt-2">
                    <a 
                      href={profile.cv_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-job-primary hover:underline flex items-center text-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Current CV
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
