import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types/project';
import { formatDate } from '../../utils/formatters';
import { PROJECT_STATUS } from '../../utils/constants';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    WAITING_ON_SUPPLIER: 'bg-yellow-100 text-yellow-800',
    WAITING_ON_DISTRIBUTOR: 'bg-yellow-100 text-yellow-800',
    INTERNAL_REVIEW: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.projectNumber}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status] || statusColors.DRAFT
            }`}
          >
            {PROJECT_STATUS[project.status] || project.status}
          </span>
        </div>
        
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            <span className="font-medium">Current Stage:</span> {project.currentStage}
          </div>
          <div>{formatDate(project.createdAt)}</div>
        </div>
        
        {project.items && project.items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            {project.items.length} item{project.items.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Link>
  );
};

