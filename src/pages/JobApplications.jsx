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
import { Loader2, Briefcase, User, Calendar, ChevronLeft, CheckCircle, Clock, XCircle, Inbox, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

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
            updatedAt: data.updatedAt?.toDate(),
            comment: data.comment || ''
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

  const handleStatusUpdate = async (applicationId, newStatus, comment = '') => {
    if (!user || profile?.role !== "employer") return;

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: newStatus,
        comment: comment,
        updatedAt: new Date()
      });

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, comment: comment, updatedAt: new Date() } 
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

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [comment, setComment] = useState('');

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async (applicationId) => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a comment before submitting"
      });
      return;
    }

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        comment: comment,
        updatedAt: new Date()
      });

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, comment: comment, updatedAt: new Date() } 
            : app
        )
      );

      toast({
        title: "Comment added",
        description: "Your comment has been saved"
      });

      setComment('');
      setSelectedApplication(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again."
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {application.job?.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {application.job?.company}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={statusColors[application.status]}>
                    {statusIcons[application.status]} {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{application.job?.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(application.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Applicant Details</h3>
                    <div className="space-y-1">
                      <p className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{application.user?.full_name || 'Anonymous'}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.user?.email}
                      </p>
                    </div>
                  </div>
                  {application.comment && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Employer Feedback</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.comment}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              {profile?.role === "employer" && (
                <>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Add Feedback</h3>
                        {selectedApplication === application.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(null)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {selectedApplication === application.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={comment}
                            onChange={handleCommentChange}
                            placeholder="Enter your feedback here..."
                            className="min-h-[100px]"
                          />
                          <Button
                            onClick={() => handleCommentSubmit(application.id)}
                            className="w-full"
                          >
                            Submit Feedback
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(application.id);
                            setComment('');
                          }}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Feedback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    {application.status !== "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(application.id, "pending")}
                      >
                        Set to Pending
                      </Button>
                    )}
                    {application.status !== "reviewing" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(application.id, "reviewing")}
                      >
                        Reviewing
                      </Button>
                    )}
                    {application.status !== "interview" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(application.id, "interview")}
                      >
                        Schedule Interview
                      </Button>
                    )}
                    {application.status !== "offered" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(application.id, "offered")}
                      >
                        Offer Position
                      </Button>
                    )}
                    {application.status !== "rejected" && (
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application.id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
