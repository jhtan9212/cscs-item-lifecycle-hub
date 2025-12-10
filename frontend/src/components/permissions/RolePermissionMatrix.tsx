import { useState, useEffect, useMemo } from 'react';
import { roleService, type Role, type Permission } from '@/services/roleService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Save, Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage } from '@/lib/errorUtils';

export const RolePermissionMatrix = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getAll(),
        roleService.getAllPermissions(),
      ]);

      // Load full role data with permissions for each role
      const rolesWithPermissions = await Promise.all(
        rolesData.map((role) => roleService.getById(role.id))
      );

      setRoles(rolesWithPermissions);
      setPermissions(permissionsData);
      setChanges(new Map());
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(permissions.map((p) => p.category)));
    return ['all', ...cats.sort()];
  }, [permissions]);

  // Filter permissions based on search and category
  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchesSearch =
        searchQuery === '' ||
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [permissions, searchQuery, selectedCategory]);

  // Check if a permission is granted for a role
  const isPermissionGranted = (roleId: string, permissionId: string): boolean => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return false;
    if (role.isAdmin) return true;

    // Check if there's a pending change
    const changeKey = `${roleId}-${permissionId}`;
    if (changes.has(changeKey)) {
      return changes.get(changeKey)!;
    }

    // Check existing permission
    const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === permissionId);
    return rolePerm?.granted ?? false;
  };

  // Toggle permission for a role
  const togglePermission = (roleId: string, permissionId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.isAdmin) return;

    const changeKey = `${roleId}-${permissionId}`;
    const currentValue = isPermissionGranted(roleId, permissionId);
    const newValue = !currentValue;

    setChanges((prev) => {
      const next = new Map(prev);
      next.set(changeKey, newValue);
      return next;
    });
  };

  // Save all changes
  const handleSave = async () => {
    if (changes.size === 0) {
      toast({
        title: 'No Changes',
        description: 'No changes to save',
      });
      return;
    }

    try {
      setSaving(true);

      // Group changes by role
      const changesByRole = new Map<string, Map<string, boolean>>();
      changes.forEach((granted, key) => {
        const [roleId, permissionId] = key.split('-');
        if (!changesByRole.has(roleId)) {
          changesByRole.set(roleId, new Map());
        }
        changesByRole.get(roleId)!.set(permissionId, granted);
      });

      // Update each role
      await Promise.all(
        Array.from(changesByRole.entries()).map(async ([roleId, permChanges]) => {
          const role = roles.find((r) => r.id === roleId);
          if (!role) return;

          // Build permissions array: include existing permissions and new changes
          const permissionsToSave = permissions.map((perm) => {
            if (permChanges.has(perm.id)) {
              // Use the changed value
              return {
                permissionId: perm.id,
                granted: permChanges.get(perm.id)!,
              };
            } else {
              // Use existing value
              const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === perm.id);
              return {
                permissionId: perm.id,
                granted: rolePerm?.granted ?? false,
              };
            }
          });

          await roleService.updatePermissions(roleId, permissionsToSave);
        })
      );

      // If user is managing their own role, refresh their user data
      if (user) {
        const userRoleChanged = Array.from(changesByRole.keys()).includes(user.roleId);
        if (userRoleChanged) {
          await refreshUser();
        }
      }

      toast({
        title: 'Success',
        description: `Successfully updated ${changes.size} permission(s). Users may need to logout and login again to see changes.`,
      });

      // Reload data and clear changes
      await loadData();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Clear all changes
  const handleClear = () => {
    setChanges(new Map());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasChanges = changes.size > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Role-Permission Matrix</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all role-permission mappings at once. Admin role has all permissions.
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button onClick={handleClear} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Clear Changes ({changes.size})
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[250px]">
                    Permission
                  </TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{role.name}</span>
                        {role.isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={roles.length + 1} className="text-center text-muted-foreground">
                      No permissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="sticky left-0 bg-background z-10">
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          {permission.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {permission.description}
                            </div>
                          )}
                          <Badge variant="outline" className="mt-1 text-xs">
                            {permission.category}
                          </Badge>
                        </div>
                      </TableCell>
                      {roles.map((role) => {
                        const granted = isPermissionGranted(role.id, permission.id);
                        const changeKey = `${role.id}-${permission.id}`;
                        const hasChange = changes.has(changeKey);
                        const disabled = role.isAdmin;

                        return (
                          <TableCell key={role.id} className="text-center">
                            <div className="flex justify-center items-center">
                              <Switch
                                checked={granted}
                                onCheckedChange={() => !disabled && togglePermission(role.id, permission.id)}
                                disabled={disabled}
                                className={hasChange ? 'ring-2 ring-primary' : ''}
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {hasChanges && (
          <div className="text-sm text-muted-foreground text-center">
            You have {changes.size} unsaved change(s). Click "Save All Changes" to apply them.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

