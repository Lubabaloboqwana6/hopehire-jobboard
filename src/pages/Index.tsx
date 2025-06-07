import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, Briefcase, Users, ExternalLink, GraduationCap, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, demoJobs } = useAuth();

  // Get 6 most recent jobs for featured section
  const featuredJobs = demoJobs.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-job-primary to-job-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Find Your Next Career Opportunity
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with employers, discover new opportunities, and take the next step in your career journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/jobs")}
              className="bg-white text-job-primary hover:bg-white/90"
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Jobs
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/register")}
                className="bg-white/10 text-white border-white hover:bg-white/20"
              >
                Create Account
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-job-text">Featured Jobs</h2>
            <Link to="/jobs" className="text-job-primary hover:underline flex items-center">
              View all jobs <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-job-primary"></div>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 bg-job-background rounded-lg">
              <Briefcase className="h-12 w-12 text-job-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No jobs available</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                There are no job listings available at the moment.
              </p>
              {user && (
                <Button onClick={() => navigate("/post-job")}>
                  Post the first job
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg text-job-text">{job.title}</h3>
                    <span className="bg-job-background text-job-text px-2 py-1 rounded-full text-xs">
                      {job.location}
                    </span>
                  </div>
                  <p className="text-job-text mt-1">{job.employer?.full_name || "Anonymous Employer"}</p>
                  <p className="mt-3 line-clamp-2 text-muted-foreground">{job.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-job-primary font-medium">{job.salary}</span>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center text-job-text mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-job-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-job-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Create an Account</h3>
              <p className="text-muted-foreground">
                Sign up as a job seeker or employer to access all features of our platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-job-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-7 w-7 text-job-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Find or Post Jobs</h3>
              <p className="text-muted-foreground">
                Browse available positions or create job listings if you're an employer.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-job-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-7 w-7 text-job-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Apply or Hire</h3>
              <p className="text-muted-foreground">
                Submit applications as a job seeker or review candidates as an employer.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/register")}>
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </section>

      {/* Free Skills Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="md:w-1/2">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6 text-job-primary" />
                <h2 className="text-2xl font-bold text-job-text">Learn Job-Ready Skills for Free</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Not qualified for the job you want? Access our curated collection of free training resources
                to learn in-demand skills that will make you stand out to employers.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-job-background text-job-primary px-3 py-1 rounded-full text-sm font-medium">
                  Microsoft Office
                </span>
                <span className="bg-job-background text-job-primary px-3 py-1 rounded-full text-sm font-medium">
                  Computer Basics
                </span>
                <span className="bg-job-background text-job-primary px-3 py-1 rounded-full text-sm font-medium">
                  Web Development
                </span>
                <span className="bg-job-background text-job-primary px-3 py-1 rounded-full text-sm font-medium">
                  Career Planning
                </span>
              </div>
              <Button 
                onClick={() => navigate("/resources")} 
                className="px-6"
              >
                Explore Free Courses
              </Button>
            </div>
            <div className="md:w-1/2 bg-job-background p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-md shadow-sm">
                <BookOpen className="h-10 w-10 text-job-primary" />
                <div>
                  <h3 className="font-medium">Start Learning Today</h3>
                  <p className="text-sm text-muted-foreground">No payment or credit card required</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-sm">Learn at your own pace</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-sm">Beginner-friendly courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-sm">Gain valuable certifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-sm">Improve your job prospects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
