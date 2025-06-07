// Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext"; // UPDATED: Import useAuth
//Firebase Setup
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase"; // ensure this is correctly set up

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const [role, setRole] = useState("job_seeker");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { handleNewUserRegistration } = useAuth(); // UPDATED: Get the function from AuthContext

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const firebaseUser = userCredential.user;

      // 2. Prepare initial profile data for Firestore
      const profileData = {
        id: firebaseUser.uid,
        email: values.email,
        role,
        full_name: "", // Initially empty
        phone: "", // Initially empty
        bio: "", // Initially empty
        skills: [], // Initially empty (relevant for job_seeker)
        cv_url: "", // Initially empty (relevant for job_seeker)
        profile_completed: false, // Mark profile as incomplete
      };

      // 3. Save the initial profile to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), profileData);

      // 4. UPDATED: Explicitly update AuthContext state *before* navigating
      handleNewUserRegistration(firebaseUser, profileData);

      toast.success("Account created! Let's set up your profile.");

      // 5. Navigate to the Edit Profile page AFTER context state is updated
      navigate("/edit-profile");
    } catch (error) {
      console.error("Registration error:", error);
      // Handle specific Firebase errors if needed (e.g., email-already-in-use)
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email address is already registered.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
      // Note: If setDoc fails after createUser, you might have an Auth user without a Firestore profile.
      // Consider adding cleanup logic here if necessary (e.g., deleting the Auth user).
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Choose your role and enter your email to create an account
            </CardDescription>
          </CardHeader>

          <Tabs
            defaultValue="jobseeker"
            className="w-full"
            onValueChange={(value) =>
              setRole(value === "jobseeker" ? "job_seeker" : "employer")
            }
          >
            <TabsList className="grid grid-cols-2 w-[90%] mx-auto mb-2">
              <TabsTrigger value="jobseeker">Job Seeker</TabsTrigger>
              <TabsTrigger value="employer">Employer</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 px-6 py-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={
                            role === "job_seeker"
                              ? "your.email@example.com"
                              : "company@example.com"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating account..."
                    : `Register as ${
                        role === "job_seeker" ? "Job Seeker" : "Employer"
                      }`}
                </Button>
              </form>
            </Form>
          </Tabs>

          <CardFooter className="flex flex-col space-y-2 mt-2">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-job-primary underline">
                Sign in
              </Link>
            </div>
            {/* You might want to remove or adjust the demo note if registration is now fully functional */}
            {/* <div className="text-center text-xs text-muted-foreground">
              Note: This is a demo application. Registration creates simulated
              accounts.
            </div> */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
