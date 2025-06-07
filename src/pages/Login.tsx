
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast.error("Invalid credentials. Please try again.");
        console.error("Login error:", error);
      } else {
        toast.success("Login successful!");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 p-3 bg-muted rounded-md">
            <p className="text-sm font-semibold mb-2">Demo Accounts:</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between items-center bg-background hover:bg-accent p-2 rounded-md">
                <div>
                  <p><strong>Job Seeker:</strong> jobseeker@example.com</p>
                  <p className="text-muted-foreground">Web developer with React experience</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fillDemoCredentials("jobseeker@example.com")}>
                  Use
                </Button>
              </div>
              <div className="flex justify-between items-center bg-background hover:bg-accent p-2 rounded-md">
                <div>
                  <p><strong>Employer:</strong> employer@example.com</p>
                  <p className="text-muted-foreground">Tech company hiring developers</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fillDemoCredentials("employer@example.com")}>
                  Use
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-job-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
