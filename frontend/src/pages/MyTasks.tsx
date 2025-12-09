import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';
import { projectService } from '../services/projectService';
import { ProjectCard } from '../components/projects/ProjectCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export const MyTasks: FC = () => {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignedProjects();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyAssigned();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view assigned projects. Please contact your administrator or log out and log back in to refresh your permissions.');
      } else {
        setError(err.message || 'Failed to load assigned projects');
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={loadAssignedProjects}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getRoleSpecificMessage = () => {
    if (isAdmin()) {
      return 'Projects requiring attention';
    }
    
    const roleName = user?.role.name || '';
    const stageName = projects[0]?.currentStage || '';
    
    const messages: Record<string, string> = {
      'Pricing Specialist': `Projects at "KINEXO Pricing" stage requiring pricing review and approval`,
      'Logistics': `Projects at "Freight Strategy" stage requiring freight strategy submission`,
      'Strategic Supply Manager': `Projects at "SSM Approval" stage requiring your review and approval`,
      'Category Manager': `Projects requiring your attention`,
      'Supplier': `Projects at "Supplier Pricing" stage requiring supplier pricing submission`,
      'DC Operator': `Projects at DC-related stages requiring distribution center operations`,
    };

    return messages[roleName] || `Projects assigned to ${roleName}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-2">
          {getRoleSpecificMessage()}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No projects assigned to you at this time</p>
          <p className="text-sm text-gray-400">
            Projects will appear here when they reach a stage that requires your role's action.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            {projects.length} project{projects.length !== 1 ? 's' : ''} requiring your action
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard project={project} />
                <div className="mt-2 space-y-2">
                  {project.currentStage === 'KINEXO Pricing' && user?.role.name === 'Pricing Specialist' && (
                    <button
                      onClick={() => navigate(`/projects/${project.id}/pricing`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Review Pricing
                    </button>
                  )}
                  {project.currentStage === 'Freight Strategy' && user?.role.name === 'Logistics' && (
                    <button
                      onClick={() => navigate(`/projects/${project.id}/freight`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Set Freight Strategy
                    </button>
                  )}
                  {project.currentStage === 'Supplier Pricing' && user?.role.name === 'Supplier' && (
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Submit Supplier Pricing
                    </button>
                  )}
                  {(project.currentStage === 'In Transition' || project.currentStage === 'DC Transition' || project.currentStage === 'DC Runout') && user?.role.name === 'DC Operator' && (
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Complete DC Setup
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                  >
                    View Project Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

