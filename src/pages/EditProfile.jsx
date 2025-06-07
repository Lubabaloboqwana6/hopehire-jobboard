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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateProfile, uploadCV } from "@/lib/types";
import { FileText } from "lucide-react";
import { updateFirebaseProfile } from "@/firebase";

const EditProfile = () => {
  const { user, profile, refreshProfile, isDemoMode } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    skills: "",
  });
  const [cvFile, setCvFile] = useState(null);
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
      skills: profile.skills ? profile.skills.join(", ") : "",
    });
  }, [user, profile, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !profile) {
      console.warn("⛔ No user or profile available");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🟡 Starting profile update...");

      // Prepare the data regardless of mode
      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        bio: formData.bio || null,
      };

      if (profile.role === "job_seeker") {
        profileData.skills = formData.skills
          ? formData.skills.split(",").map((skill) => skill.trim())
          : [];
        console.log("🧠 Skills parsed:", profileData.skills);
      }

      // Handle CV Upload (only if not demo and job seeker)
      if (cvFile && profile.role === "job_seeker" && !isDemoMode) {
        console.log("📄 Uploading CV for user:", user.uid);
        const { data: publicUrl } = await uploadCV(user.id, cvFile);
        if (publicUrl) {
          profileData.cv_url = publicUrl.publicUrl;
          console.log("✅ CV uploaded, public URL:", profileData.cv_url);
        } else {
          console.warn("⚠️ CV upload returned no public URL");
        }
      }

      if (isDemoMode) {
        console.log("🧪 Demo mode active — updating local state");
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

        // *** CHANGE THIS: Use updateProfile instead of refreshProfile for demo mode ***
        // await refreshProfile(); // <-- REMOVE THIS LINE for demo mode
        await updateProfile(profileData); // <-- ADD THIS LINE for demo mode

        toast({
          title: "Profile Updated!",
          description:
            "Your profile has been updated successfully (demo mode).",
        });
      } else {
        // Firebase Logic (remains the same)
        console.log("🚀 Updating Firebase profile for UID:", user.uid);
        console.log("📦 Data to send:", profileData);
        await updateFirebaseProfile(user.uid, profileData);
        console.log("✅ Firebase update complete");

        await refreshProfile(); // Keep this: refresh from the source of truth (Firestore)
        console.log("🔄 Refreshed profile");

        toast({
          title: "Profile Updated!",
          description: "Your profile has been updated successfully.",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
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
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
        {isDemoMode && (
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              This is demo mode. Connect to Supabase for full functionality.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default EditProfile;
