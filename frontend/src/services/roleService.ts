import api from './api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isAdmin: boolean;
  rolePermissions?: RolePermission[];
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  granted: boolean;
  permission?: Permission;
}

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/roles/permissions/all');
    return response.data;
  },

  updatePermissions: async (
    roleId: string,
    permissions: { permissionId: string; granted: boolean }[]
  ): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },
};
