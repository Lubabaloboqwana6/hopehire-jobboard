// src/pages/JobsListing.jsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Briefcase,
  MapPin,
  BadgeDollarSign,
  ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

const JobsListing = () => {
  const {
    user,
    profile,
    jobs = [],
    loading: authLoading,
    refreshJobs,
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5; // From reference style code

  const parseFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === "function")
      return timestamp.toDate();
    if (timestamp.seconds && typeof timestamp.seconds === "number")
      return new Date(timestamp.seconds * 1000);
    if (!isNaN(new Date(timestamp).getTime())) return new Date(timestamp);
    return null;
  };

  const filteredJobs = jobs
    .filter((job) => {
      if (!job || typeof job !== "object" || !job.id) return false;
      const roleFilter = true; // Keeping this to show all jobs

      const lowerSearchTerm = searchTerm.toLowerCase();
      // Simplified search filter from reference style (title, description, location)
      // You can add back companyName, employer.full_name if desired
      const searchFilter = searchTerm
        ? job.title?.toLowerCase()?.includes(lowerSearchTerm) ||
          job.description?.toLowerCase()?.includes(lowerSearchTerm) ||
          job.location?.toLowerCase()?.includes(lowerSearchTerm)
        : true;
      return roleFilter && searchFilter;
    })
    .sort((a, b) => {
      const dateA = parseFirestoreTimestamp(a.created_at || a.createdAt);
      const dateB = parseFirestoreTimestamp(b.created_at || b.createdAt);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Using text from reference style code
  const pageTitle = "Available Jobs";
  const pageSubtitle = "Find your next opportunity";

  // Loading state styled as per reference
  if (authLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[calc(100vh-200px)]">
        <div className="text-center">
          {/* Mapped border-job-primary to border-primary, text-job-text to text-foreground */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {" "}
      {/* Added px from your previous code for consistency */}
      {/* Header and search bar structure from reference */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          {/* Mapped text-job-text to text-foreground */}
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-2">{pageSubtitle}</p>
        </div>
        <div className="w-full md:w-80">
          {" "}
          {/* Width from reference */}
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 text-base" // Added custom height and text size
            type="search"
          />
        </div>
      </div>

      {/* Regular Jobs Section */}
      {currentJobs.length === 0 ? (
        // "No jobs found" state styled as per reference
        <div className="text-center py-20 min-h-[calc(100vh-400px)] flex flex-col justify-center items-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground">
            No jobs found
          </h3>
          {searchTerm ? (
            <p className="text-muted-foreground mt-2">
              No jobs match your search criteria. Try different keywords.
            </p>
          ) : (
            <p className="text-muted-foreground mt-2">
              There are no job listings available at the moment.
            </p>
          )}
          {/* Added refresh button from your version, it's a good UX */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              refreshJobs();
            }}
            className="mt-6"
          >
            {searchTerm ? "Clear Search & Refresh" : "Refresh Jobs"}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {" "}
            {/* Grid from reference */}
            {currentJobs.map((job) => {
              if (!job || !job.id) return null;
              const createdAt = parseFirestoreTimestamp(
                job.created_at || job.createdAt
              );
              const deadline = parseFirestoreTimestamp(job.deadline);
              // Using employer.full_name from reference, with fallbacks
              const employerName =
                job.employer?.full_name ||
                job.employer?.companyName ||
                job.companyName ||
                "Anonymous Employer";
              const isNewJob =
                createdAt &&
                createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // "New" if within 7 days

              return (
                <Card
                  key={job.id}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-300 border dark:border-border"
                >
                  {" "}
                  {/* Added border from your code */}
                  {/* CardContent structure from reference: p-0 then inner div with p-6 */}
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* Mapped text-job-text to text-foreground */}
                          <h2 className="text-xl font-semibold text-foreground hover:text-primary">
                            <Link
                              to={`/jobs/${job.id}`}
                              state={{ jobData: job }}
                            >
                              {job.title || "Untitled Position"}
                            </Link>
                          </h2>
                          {/* Mapped text-job-text to text-muted-foreground for less emphasis */}
                          <p className="text-muted-foreground mt-1">
                            {employerName}
                          </p>
                        </div>
                        {/* "New" badge styling from reference */}
                        {isNewJob && (
                          // Mapped bg-job-background to bg-muted, text-job-text to text-foreground
                          <div className="bg-muted text-foreground text-sm font-medium px-3 py-1 rounded-full">
                            New
                          </div>
                        )}
                      </div>

                      {/* Info items from reference */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5 text-primary/80" />{" "}
                          {/* Added icon color */}
                          <span>{job.location || "Not specified"}</span>
                        </div>
                        {job.salary && ( // Only show if salary exists
                          <div className="flex items-center">
                            <BadgeDollarSign className="h-4 w-4 mr-1.5 text-primary/80" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {deadline && ( // Only show if deadline exists
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1.5 text-primary/80" />
                            {/* Using PPP format from reference */}
                            <span>Deadline: {format(deadline, "PPP")}</span>
                          </div>
                        )}
                        {job.jobType && ( // Added jobType from your version
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1.5 text-primary/80" />
                            <span>{job.jobType}</span>
                          </div>
                        )}
                      </div>

                      {/* Description from reference */}
                      <p className="mt-4 line-clamp-3 text-muted-foreground/90 leading-relaxed">
                        {job.description
                          ?.replace(/<[^>]*>?/gm, "")
                          .substring(0, 150)
                          .trim() +
                          (job.description?.length > 150 ? "..." : "") ||
                          "No description available."}
                      </p>

                      {/* Button from reference */}
                      <div className="mt-6 flex justify-end">
                        <Button asChild>
                          <Link to={`/jobs/${job.id}`} state={{ jobData: job }}>
                            View Job
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination from reference */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => paginate(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>

                {/* Using your improved pagination number display logic */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    if (currentPage + 2 <= totalPages) {
                      pageNumber = currentPage - 2 + i;
                    } else {
                      pageNumber = totalPages - 4 + i;
                    }
                  }
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => paginate(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 &&
                  currentPage < totalPages - 2 &&
                  totalPages > Math.min(totalPages, 5) && ( // Ensure ellipsis only if needed
                    <PaginationItem>
                      <span className="px-3 py-1.5 text-muted-foreground">
                        ...
                      </span>
                    </PaginationItem>
                  )}
                {totalPages > 5 &&
                  currentPage < totalPages - 1 &&
                  totalPages > Math.min(totalPages, 5) && ( // Ensure last page only if not already shown
                    <PaginationItem>
                      <PaginationLink onClick={() => paginate(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => paginate(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default JobsListing;
