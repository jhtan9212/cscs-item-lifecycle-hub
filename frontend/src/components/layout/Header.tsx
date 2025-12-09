import type { FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationBell } from '../notifications/NotificationBell';
import { usePermissions } from '../../hooks/usePermissions';

export const Header: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Item Lifecycle Hub</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link to="/my-tasks">
                  <Button variant="outline" size="sm">
                    My Tasks
                  </Button>
                </Link>
                <Link to="/tasks">
                  <Button variant="outline" size="sm">
                    Tasks
                  </Button>
                </Link>
                {hasPermission('MANAGE_PERMISSIONS') && (
                  <Link to="/role-management">
                    <Button variant="outline" size="sm">
                      Manage Roles
                    </Button>
                  </Link>
                )}
                {hasPermission('MANAGE_USERS') && (
                  <Link to="/user-management">
                    <Button variant="outline" size="sm">
                      Manage Users
                    </Button>
                  </Link>
                )}
                {hasPermission('VIEW_AUDIT_LOGS') && (
                  <Link to="/audit-logs">
                    <Button variant="outline" size="sm">
                      Audit Logs
                    </Button>
                  </Link>
                )}
                <NotificationBell />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 ml-2">({user.role.name})</span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
