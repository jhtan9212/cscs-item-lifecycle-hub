import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roleId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  changePassword: async (id: string, newPassword: string): Promise<void> => {
    await api.post(`/users/${id}/change-password`, { newPassword });
  },

  deactivate: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  activate: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/activate`);
    return response.data;
  },
};
