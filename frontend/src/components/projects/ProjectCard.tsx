import { Link } from 'react-router-dom';
import type { Project } from '@/types/project';
import { formatDate } from '@/utils/formatters';
import { PROJECT_STATUS } from '@/utils/constants';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'COMPLETED') return 'default';
    if (status === 'REJECTED') return 'destructive';
    if (status === 'IN_PROGRESS' || status === 'INTERNAL_REVIEW') return 'secondary';
    return 'outline';
  };

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{project.projectNumber}</p>
            </div>
            <Badge variant={getStatusVariant(project.status)} className="shrink-0">
              {PROJECT_STATUS[project.status] || project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium">Stage:</span> {project.currentStage}
            </div>
            <div className="text-muted-foreground">{formatDate(project.createdAt)}</div>
          </div>

          {project.items && project.items.length > 0 && (
            <div className="text-sm text-muted-foreground pt-2 border-t">
              {project.items.length} item{project.items.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
