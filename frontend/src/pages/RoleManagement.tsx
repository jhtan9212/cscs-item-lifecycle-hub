import { useState, useEffect } from 'react';
import { roleService, type Role } from '@/services/roleService';
import { PermissionMatrix } from '@/components/permissions/PermissionMatrix';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAll();
      setRoles(data);
      if (data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h1>
        <p className="text-muted-foreground mt-2">
          Configure which permissions each role has. Admin role always has all permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg transition-colors',
                    selectedRoleId === role.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-xs mt-1 opacity-75">{role.description}</div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {selectedRoleId ? (
            <PermissionMatrix roleId={selectedRoleId} onUpdate={loadRoles} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Select a role to manage permissions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
