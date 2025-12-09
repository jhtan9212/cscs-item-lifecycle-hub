import api from './api';
import { Project } from '../types/project';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  advanceWorkflow: async (id: string, comment?: string, userId?: string): Promise<any> => {
    const response = await api.post(`/projects/${id}/advance`, { comment, userId });
    return response.data;
  },

  moveBackWorkflow: async (id: string, comment?: string, userId?: string): Promise<any> => {
    const response = await api.post(`/projects/${id}/back`, { comment, userId });
    return response.data;
  },

  getWorkflowStatus: async (id: string): Promise<any> => {
    const response = await api.get(`/projects/${id}/workflow`);
    return response.data;
  },
};

