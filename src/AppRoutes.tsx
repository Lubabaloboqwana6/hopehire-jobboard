import * as React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard.tsx";
import EditProfile from "./pages/EditProfile";
import PostJob from "./pages/PostJob.tsx";
import JobsListing from "./pages/JobsListing";
import JobDetails from "./pages/JobDetails";
import JobApplications from "./pages/JobApplications";
import Resources from "./pages/Resources";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/jobs" element={<JobsListing />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:id/applications" element={<JobApplications />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </AuthProvider>
  );
};

export default AppRoutes;
