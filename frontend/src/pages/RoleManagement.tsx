import { useState, useEffect } from 'react';
import { roleService, type Role } from '@/services/roleService';
import { PermissionMatrix } from '@/components/permissions/PermissionMatrix';
import { RolePermissionMatrix } from '@/components/permissions/RolePermissionMatrix';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errorUtils';

export const RoleManagement = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h1>
        <p className="text-muted-foreground mt-2">
          Configure which permissions each role has. Admin role always has all permissions.
        </p>
      </div>

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="role-view">Role View</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-6">
          <RolePermissionMatrix />
        </TabsContent>

        <TabsContent value="role-view" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
