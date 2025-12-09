import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Dashboard: FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Item Lifecycle Hub Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
          <p className="text-gray-600 text-sm mb-4">Manage item lifecycle projects</p>
          <Link to="/projects">
            <Button variant="primary" size="sm">
              View Projects
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow</h3>
          <p className="text-gray-600 text-sm mb-4">Track project workflow stages</p>
          <Link to="/projects">
            <Button variant="primary" size="sm">
              View Workflows
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Items</h3>
          <p className="text-gray-600 text-sm mb-4">Manage items across projects</p>
          <Link to="/projects">
            <Button variant="primary" size="sm">
              View Items
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link to="/projects/new">
            <Button>Create New Project</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

