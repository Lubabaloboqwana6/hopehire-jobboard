
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BookOpen, Code, MonitorPlay, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const navigate = useNavigate();
  
  const resources = [
    {
      title: "GCF Global",
      description: "Free courses on computer basics, office skills, and career planning to build your foundation.",
      link: "https://edu.gcfglobal.org",
      categories: ["Computer Basics", "Internet Basics", "Office Skills", "Career Planning"],
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "DigitalLearn.org",
      description: "Learn essential computer skills with beginner-friendly courses designed for career advancement.",
      link: "https://www.digitallearn.org",
      categories: ["Computer Basics", "Internet Basics", "Online Privacy"],
      icon: <MonitorPlay className="h-6 w-6" />,
    },
    {
      title: "Microsoft Learn",
      description: "Master Microsoft tools and technologies with free training and certifications for your resume.",
      link: "https://learn.microsoft.com",
      categories: ["Microsoft Office", "Windows", "Programming", "Azure"],
      icon: <Code className="h-6 w-6" />,
    },
    {
      title: "LinkedIn Learning",
      description: "Develop in-demand business, creative, and technical skills with expert-led video courses.",
      link: "https://www.linkedin.com/learning/",
      categories: ["Business", "Technology", "Creative"],
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Khan Academy",
      description: "Build academic and professional skills with interactive lessons across various subjects.",
      link: "https://www.khanacademy.org",
      categories: ["Math", "Science", "Computer Programming", "Economics"],
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      title: "freeCodeCamp",
      description: "Learn to code and build projects for your portfolio with hands-on web development training.",
      link: "https://www.freecodecamp.org",
      categories: ["Web Development", "Data Science", "Machine Learning"],
      icon: <Code className="h-6 w-6" />,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-job-text mb-4">Free Skills Training</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn job-ready skills with these free online resources. Boost your employability 
          and unlock new career opportunities without spending a dime.
        </p>
        
        <div className="mt-6 inline-block">
          <Button 
            variant="outline" 
            onClick={() => navigate("/jobs")}
            className="bg-job-primary/10 border-job-primary text-job-primary hover:bg-job-primary hover:text-white"
          >
            Find Jobs Using These Skills
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-job-background pb-2">
              <div className="text-job-primary mb-2">{resource.icon}</div>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Skills you'll learn:</p>
                <div className="flex flex-wrap gap-2">
                  {resource.categories.map((category, i) => (
                    <span key={i} className="bg-job-muted text-job-text px-2 py-1 rounded-md text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              
              <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-job-primary hover:underline"
              >
                Start Learning <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Resources;
