// src/pages/Applications.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

const Applications = () => {
  const { user, profile, applications, jobs } = useAuth();
  const [filteredApplications, setFilteredApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile || profile.role !== "employer") return;

    const myJobIds = jobs
      .filter((job) => job.employer_id === user.uid)
      .map((job) => job.id);

    const employerApplications = applications.filter((app) =>
      myJobIds.includes(app.jobId)
    );

    setFilteredApplications(employerApplications);
  }, [user, profile, applications, jobs]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, { status: newStatus });
      setFilteredApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (!user || !profile || profile.role !== "employer") {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="mb-4">Only employers can view this page.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Applications</h1>

      <Card>
        <CardHeader className="bg-job-background">
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>
            View and update status of applications to your posted jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                className="border rounded-md p-4 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{app.applicantName}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.jobTitle}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {app.status}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <label className="text-sm text-muted-foreground">
                    Update Status:
                  </label>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                    <option value="got the job">Got the Job</option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No applications submitted to your jobs yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;
