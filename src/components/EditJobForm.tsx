import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const EditJobForm = () => {
  const { id } = useParams();
  const { user, profile, editJob } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id || !user || !profile) {
        navigate('/dashboard');
        return;
      }

      try {
        const jobRef = doc(db, 'jobs', id);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          toast({
            title: "Error",
            description: "Job not found",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        const jobData = jobSnap.data();
        
        // Check if user is the job owner
        if (jobData.employer_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own job postings",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        // Format the deadline date
        const deadline = jobData.deadline?.toDate?.() || new Date(jobData.deadline);
        
        setFormState({
          title: jobData.title,
          description: jobData.description,
          salary: jobData.salary,
          location: jobData.location,
          deadline: format(deadline, 'yyyy-MM-dd'),
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user, profile, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.title || !formState.description || !formState.salary || !formState.location || !formState.deadline) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await editJob(id!, {
        ...formState,
        deadline: new Date(formState.deadline).toISOString(),
      });
      
      toast({
        title: "Success",
        description: "Job updated successfully!",
      });
      
      navigate(`/jobs/${id}`);
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/jobs/${id}`)}
          className="flex items-center text-job-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Job Details
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Job</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                className="min-h-[150px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                name="salary"
                value={formState.salary}
                onChange={handleChange}
                placeholder="e.g. $50,000 - $70,000"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formState.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formState.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/jobs/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-job-text hover:bg-slate-700 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditJobForm;
