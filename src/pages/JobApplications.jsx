// src/pages/JobApplications.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Briefcase, User, Calendar, ChevronLeft, CheckCircle, Clock, XCircle, Inbox } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

const statusIcons = {
  pending: <Clock className="h-4 w-4 mr-1" />,
  reviewing: <Loader2 className="h-4 w-4 mr-1 animate-spin" />,
  interview: <User className="h-4 w-4 mr-1" />,
  offered: <CheckCircle className="h-4 w-4 mr-1" />,
  rejected: <XCircle className="h-4 w-4 mr-1" />
};

const JobApplications = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const applicationsRef = collection(db, "applications");
        let q;

        if (profile?.role === "employer") {
          // Employers see applications for their jobs
          q = query(applicationsRef, where("employerId", "==", user.uid));
        } else {
          // Job seekers see their own applications
          q = query(applicationsRef, where("applicantId", "==", user.uid));
        }


        const querySnapshot = await getDocs(q);
        const apps = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          // Fetch job details
          const jobDoc = await getDocs(query(
            collection(db, "jobs"),
            where("__name__", "==", data.jobId)
          ));
          
          const jobData = jobDoc.docs[0]?.data();
          
          // Fetch applicant/employer details
          const userDoc = await getDocs(query(
            collection(db, "users"),
            where("__name__", "==", profile?.role === "employer" ? data.applicantId : data.employerId)
          ));
          
          const userData = userDoc.docs[0]?.data();

          apps.push({
            id: doc.id,
            ...data,
            job: jobData,
            user: userData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
        }


        setApplications(apps);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load applications. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, profile, toast]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (!user || profile?.role !== "employer") return;

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, updatedAt: new Date() } 
            : app
        )
      );

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status. Please try again."
      });
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === "all" || app.status === selectedStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-job-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="-ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {profile?.role === "employer" ? "Job Applications" : "My Applications"}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === "employer" 
              ? "Review and manage applications for your job postings"
              : "Track the status of your job applications"}
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-muted-foreground mt-2">
            {profile?.role === "employer" 
              ? "You don't have any applications yet."
              : "You haven't applied to any jobs yet."}
          </p>
          {profile?.role !== "employer" && (
            <Button className="mt-4" onClick={() => navigate("/jobs")}>
              Browse Jobs
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {application.job?.title || "Job Title Not Available"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {profile?.role === "employer" ? (
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {application.user?.fullName || application.user?.email || "Applicant"}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {application.user?.companyName || application.user?.fullName || "Employer"}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge className={statusColors[application.status] + " flex items-center"}>
                      {statusIcons[application.status]}
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Applied on</p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(application.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last updated</p>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(application.updatedAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {profile?.role === "employer" ? "Applicant's Message" : "Your Message"}
                    </p>
                    <p className="line-clamp-1">
                      {application.message || "No message provided"}
                    </p>
                  </div>
                </div>

                {profile?.role === "employer" && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {["reviewing", "interview", "offered", "rejected"].map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, status)}
                          disabled={application.status === status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/jobs/${application.jobId}`}>
                    View Job Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
