
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    if (isOpen) setIsOpen(false);
  };

  const handleSignIn = () => {
    navigate("/login");
    if (isOpen) setIsOpen(false);
  };

  const handleSignUp = () => {
    navigate("/register");
    if (isOpen) setIsOpen(false);
  };

  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-job-primary" />
            <span className="text-xl font-bold text-job-text">HopeHire</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-6">
          <Link 
            to="/" 
            className="text-job-text hover:text-job-primary px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/jobs" 
            className="text-job-text hover:text-job-primary px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            Jobs
          </Link>
          <Link 
            to="/resources" 
            className="text-job-text hover:text-job-primary px-3 py-2"
            onClick={() => setIsOpen(false)}
          >
            Learn Skills
          </Link>

          {user ? (
            <>
              {profile?.role === "employer" ? (
                <Link 
                  to="/post-job" 
                  className="text-job-text hover:text-job-primary px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Post Job
                </Link>
              ) : null}
              <Link 
                to="/dashboard" 
                className="text-job-text hover:text-job-primary px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="mt-2 w-full">
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="w-full"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignUp}
                className="w-full"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-job-primary" />
          <span className="text-xl font-bold text-job-text">HopeHire</span>
        </Link>

        {isMobile ? (
          <MobileMenu />
        ) : (
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-job-text hover:text-job-primary px-3 py-2">
              Home
            </Link>
            <Link to="/jobs" className="text-job-text hover:text-job-primary px-3 py-2">
              Jobs
            </Link>
            <Link to="/resources" className="text-job-text hover:text-job-primary px-3 py-2">
              Learn Skills
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {profile?.role === "employer" ? (
                  <Link to="/post-job" className="text-job-text hover:text-job-primary px-3 py-2">
                    Post Job
                  </Link>
                ) : null}
                <Link 
                  to="/dashboard" 
                  className="text-job-text hover:text-job-primary px-3 py-2"
                >
                  {profile?.full_name || user.email}
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button onClick={handleSignUp}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
