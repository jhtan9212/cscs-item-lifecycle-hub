import { useState, useEffect } from 'react';
import { roleService, type Role, type Permission } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { Info, Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PermissionMatrixProps {
  roleId: string;
  onUpdate?: () => void;
}

export const PermissionMatrix = ({ roleId, onUpdate }: PermissionMatrixProps) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [roleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roleData, permissionsData] = await Promise.all([
        roleService.getById(roleId),
        roleService.getAllPermissions(),
      ]);

      setRole(roleData);
      setPermissions(permissionsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!role || role.isAdmin) return;

    const existingPermission = role.rolePermissions?.find((rp) => rp.permissionId === permissionId);

    if (!role.rolePermissions) {
      role.rolePermissions = [];
    }

    if (existingPermission) {
      existingPermission.granted = !existingPermission.granted;
    } else {
      role.rolePermissions.push({
        id: '',
        roleId: role.id,
        permissionId,
        granted: true,
      } as any);
    }

    setRole({ ...role });
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const permissionsToSave = permissions.map((perm) => {
        const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === perm.id);
        return {
          permissionId: perm.id,
          granted: rolePerm?.granted ?? false,
        };
      });

      await roleService.updatePermissions(role.id, permissionsToSave);
      await loadData();

      // If user is managing their own role, refresh their user data
      if (user && user.roleId === role.id) {
        await refreshUser();
      }

      setSuccess('Permissions updated successfully!');
      toast({
        title: 'Success',
        description:
          'Permissions updated successfully! Users with this role may need to logout and login again to see changes.',
      });
      onUpdate?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save permissions');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save permissions',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Role not found'}</AlertDescription>
      </Alert>
    );
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const isPermissionGranted = (permissionId: string): boolean => {
    if (role.isAdmin) return true;
    const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === permissionId);
    return rolePerm?.granted ?? false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{role.name} Permissions</CardTitle>
            {role.description && (
              <CardDescription className="mt-1">{role.description}</CardDescription>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving || role.isAdmin}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {role.isAdmin && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Role:</strong> This role has all permissions by default.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
            <div key={category}>
              <h4 className="text-md font-semibold mb-3">{category}</h4>
              <div className="space-y-2">
                {categoryPermissions.map((permission) => {
                  const granted = isPermissionGranted(permission.id);
                  const disabled = role.isAdmin;

                  return (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{permission.name}</span>
                          {permission.description && (
                            <span className="text-sm text-muted-foreground">
                              • {permission.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={granted}
                        onCheckedChange={() => !disabled && togglePermission(permission.id)}
                        disabled={disabled}
                        className="ml-4"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
