import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { roleService, type Role, type Permission } from '../../services/roleService';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PermissionMatrixProps {
  roleId: string;
  onUpdate?: () => void;
}

export const PermissionMatrix: FC<PermissionMatrixProps> = ({ roleId, onUpdate }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!role) return;

    const existingPermission = role.rolePermissions?.find(
      (rp) => rp.permissionId === permissionId
    );

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
      const permissionsToSave = permissions.map((perm) => {
        const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === perm.id);
        return {
          permissionId: perm.id,
          granted: rolePerm?.granted ?? false,
        };
      });

      await roleService.updatePermissions(role.id, permissionsToSave);
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save permissions');
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Role not found'}</p>
      </div>
    );
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const isPermissionGranted = (permissionId: string): boolean => {
    const rolePerm = role.rolePermissions?.find((rp) => rp.permissionId === permissionId);
    return rolePerm?.granted ?? false;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{role.name} Permissions</h3>
          {role.description && (
            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
          )}
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </div>

      {role.isAdmin && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Admin Role:</strong> This role has all permissions by default.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <div key={category}>
            <h4 className="text-md font-semibold text-gray-700 mb-3">{category}</h4>
            <div className="space-y-2">
              {categoryPermissions.map((permission) => {
                const granted = isPermissionGranted(permission.id);
                const disabled = role.isAdmin;

                return (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{permission.name}</span>
                        {permission.description && (
                          <span className="text-sm text-gray-500">• {permission.description}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => !disabled && togglePermission(permission.id)}
                      disabled={disabled}
                      className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        granted ? 'bg-blue-600' : 'bg-gray-200'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          granted ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

