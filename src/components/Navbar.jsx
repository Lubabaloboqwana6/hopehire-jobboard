import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

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

  // --- isActive function correctly defined here ---
  const getNavLinkClass = (path) => {
    // Renamed inner variable to avoid shadowing and improved clarity
    // Also, using the classes defined in the original erroneous placement
    const isCurrentPathActive = location.pathname === path;
    return isCurrentPathActive
      ? 'text-job-primary font-medium border-b-2 border-job-primary' // Classes from your misplaced function
      : 'text-gray-600 hover:text-job-primary transition-colors';   // Classes from your misplaced function
  };
  
  // --- MobileMenu sub-component ---
  // Note: It's generally better to define sub-components outside the parent if they don't heavily rely on its direct scope,
  // or memoize them if they are defined inside and might cause re-renders.
  // For simplicity here, keeping it inline.
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
            className={`px-3 py-2 ${getNavLinkClass('/')}`} // Using getNavLinkClass
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className={`px-3 py-2 ${getNavLinkClass('/jobs')}`} // Using getNavLinkClass
            onClick={() => setIsOpen(false)}
          >
            Jobs
          </Link>
          <Link
            to="/resources"
            className={`px-3 py-2 ${getNavLinkClass('/resources')}`} // Using getNavLinkClass
            onClick={() => setIsOpen(false)}
          >
            Learn Skills
          </Link>

          {user ? (
            <>
              {profile?.role === "employer" ? (
                <>
                  <Link
                    to="/post-job"
                    className={`px-3 py-2 ${getNavLinkClass('/post-job')}`} // Using getNavLinkClass
                    onClick={() => setIsOpen(false)}
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/applications"
                    className={`px-3 py-2 ${getNavLinkClass('/applications')}`} // Using getNavLinkClass
                    onClick={() => setIsOpen(false)}
                  >
                    Applications
                  </Link>
                </>
              ) : (
                <Link
                  to="/applications"
                  className={`px-3 py-2 ${getNavLinkClass('/applications')}`} // Using getNavLinkClass
                  onClick={() => setIsOpen(false)}
                >
                  My Applications
                </Link>
              )}
              <Link
                to="/dashboard"
                className={`px-3 py-2 ${getNavLinkClass('/dashboard')}`} // Using getNavLinkClass
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
          <div className="hidden md:flex items-center space-x-4"> {/* Added items-center for vertical alignment */}
            <Link to="/" className={`px-3 py-2 ${getNavLinkClass('/')}`}>
              Home
            </Link>
            <Link to="/jobs" className={`px-3 py-2 ${getNavLinkClass('/jobs')}`}>
              Jobs
            </Link>
            <Link to="/resources" className={`px-3 py-2 ${getNavLinkClass('/resources')}`}>
              Learn Skills
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {profile?.role === "employer" ? (
                  <>
                    <Link to="/post-job" className={`px-3 py-2 ${getNavLinkClass('/post-job')}`}>
                      Post Job
                    </Link>
                    <Link
                      to="/applications"
                      className={`px-3 py-2 ${getNavLinkClass('/applications')}`}
                    >
                      Applications
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/applications"
                    className={`px-3 py-2 ${getNavLinkClass('/applications')}`}
                  >
                    My Applications
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className={`px-3 py-2 ${getNavLinkClass('/dashboard')}`}
                >
                  {profile?.full_name || user.email} {/* Showing name or email */}
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
      {/* The misplaced isActive function was removed from here */}
    </nav>
  );
};

export default Navbar;