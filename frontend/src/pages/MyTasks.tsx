import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/lib/errorUtils';

export const MyTasks = () => {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedProjects();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyAssigned();
      setProjects(data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      if (err.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to view assigned projects. Please contact your administrator.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRoleSpecificMessage = () => {
    if (isAdmin()) {
      return 'Projects requiring attention';
    }

    const roleName = user?.role.name || '';

    const messages: Record<string, string> = {
      'Pricing Specialist': `Projects at "KINEXO Pricing" stage requiring pricing review and approval`,
      Logistics: `Projects at "Freight Strategy" stage requiring freight strategy submission`,
      'Strategic Supply Manager': `Projects at "SSM Approval" stage requiring your review and approval`,
      'Category Manager': `Projects requiring your attention`,
      Supplier: `Projects at "Supplier Pricing" stage requiring supplier pricing submission`,
      'DC Operator': `Projects at DC-related stages requiring distribution center operations`,
    };

    return messages[roleName] || `Projects assigned to ${roleName}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-2">{getRoleSpecificMessage()}</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">No projects assigned to you at this time</p>
            <p className="text-sm text-muted-foreground text-center">
              Projects will appear here when they reach a stage that requires your role's action.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''} requiring your action
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <ProjectCard project={project} />
                <div className="space-y-2">
                  {project.currentStage === 'KINEXO Pricing' &&
                    user?.role.name === 'Pricing Specialist' && (
                      <Button
                        onClick={() => navigate(`/projects/${project.id}/pricing`)}
                        className="w-full"
                        size="sm"
                      >
                        Review Pricing
                      </Button>
                    )}
                  {project.currentStage === 'Freight Strategy' &&
                    user?.role.name === 'Logistics' && (
                      <Button
                        onClick={() => navigate(`/projects/${project.id}/freight`)}
                        className="w-full"
                        size="sm"
                      >
                        Set Freight Strategy
                      </Button>
                    )}
                  {project.currentStage === 'Supplier Pricing' &&
                    user?.role.name === 'Supplier' && (
                      <Button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="w-full"
                        size="sm"
                      >
                        Submit Supplier Pricing
                      </Button>
                    )}
                  {(project.currentStage === 'In Transition' ||
                    project.currentStage === 'DC Transition' ||
                    project.currentStage === 'DC Runout') &&
                    user?.role.name === 'DC Operator' && (
                      <Button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="w-full"
                        size="sm"
                      >
                        Complete DC Setup
                      </Button>
                    )}
                  <Button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    View Project Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
