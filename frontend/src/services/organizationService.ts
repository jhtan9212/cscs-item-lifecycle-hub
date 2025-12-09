import api from './api';

export interface Organization {
  id: string;
  name: string;
  domain?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    projects: number;
  };
}

export interface CreateOrganizationData {
  name: string;
  domain?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

export const organizationService = {
  /**
   * Get all organizations (Admin only)
   */
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  /**
   * Get organization by ID (Admin only)
   */
  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  /**
   * Create new organization (Admin only)
   */
  create: async (data: CreateOrganizationData): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  /**
   * Update organization (Admin only)
   */
  update: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    const response = await api.put<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  /**
   * Delete organization (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },

  /**
   * Assign user to organization (Admin only)
   */
  assignUser: async (userId: string, organizationId: string): Promise<any> => {
    const response = await api.post(`/organizations/${organizationId}/assign-user`, {
      userId,
      organizationId,
    });
    return response.data;
  },

  /**
   * Get organization users (Admin only)
   */
  getUsers: async (id: string): Promise<any[]> => {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },
};

