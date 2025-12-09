import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from './LoadingSpinner';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requiredPermission?: string;
  requiredPermissions?: string[];
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requiredPermission,
  requiredPermissions,
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isAdmin } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check both user state and localStorage to handle race conditions
  // This ensures that if user just registered, we don't redirect to login
  const hasStoredUser = localStorage.getItem('user') && localStorage.getItem('token');

  if (!user && !hasStoredUser) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>Admin access required</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check multiple permissions requirement (all must be present)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => hasPermission(perm));
    if (!hasAll) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>You don't have the required permissions</CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};
