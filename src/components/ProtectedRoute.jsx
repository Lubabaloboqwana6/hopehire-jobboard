import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProtectedRoute = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!profile) {
      toast({
        title: "Profile required",
        description: "Please complete your profile setup.",
        variant: "destructive",
      });
      navigate('/profile-setup');
      return;
    }
  }, [user, profile, navigate, toast]);

  // If user is not authenticated, don't render children
  if (!user || !profile) {
    return null;
  }

  // If user is authenticated, render children
  return children;
};

export default ProtectedRoute; 