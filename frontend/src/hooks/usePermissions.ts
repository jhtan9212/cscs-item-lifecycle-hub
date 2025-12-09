import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to check user permissions
 * Returns functions to check if user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return new Set<string>();

    // Admin has all permissions
    if (user.role.isAdmin) {
      // Return a set with all possible permissions
      // In a real app, you might want to fetch all permissions from the API
      return new Set<string>([
        'CREATE_PROJECT',
        'UPDATE_PROJECT',
        'DELETE_PROJECT',
        'VIEW_PROJECT',
        'CREATE_ITEM',
        'UPDATE_ITEM',
        'DELETE_ITEM',
        'VIEW_ITEM',
        'ADVANCE_WORKFLOW',
        'MOVE_BACK_WORKFLOW',
        'APPROVE_PRICING',
        'SUBMIT_PRICING',
        'VIEW_PRICING',
        'MANAGE_USERS',
        'MANAGE_ROLES',
        'MANAGE_PERMISSIONS',
        'VIEW_AUDIT_LOGS',
      ]);
    }

    // Extract granted permissions from role
    const grantedPermissions = new Set<string>();
    user.role.rolePermissions?.forEach((rp) => {
      if (rp.granted && rp.permission) {
        grantedPermissions.add(rp.permission.name);
      }
    });

    return grantedPermissions;
  }, [user]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    return permissions.has(permissionName);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some((name) => permissions.has(name));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every((name) => permissions.has(name));
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role.isAdmin ?? false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    permissions: Array.from(permissions),
  };
};

