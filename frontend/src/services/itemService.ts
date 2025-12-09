import api from './api';
import { Item } from '../types/item';

export const itemService = {
  getByProject: async (projectId: string): Promise<Item[]> => {
    const response = await api.get<Item[]>(`/items/projects/${projectId}/items`);
    return response.data;
  },

  getById: async (id: string): Promise<Item> => {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: Partial<Item>): Promise<Item> => {
    const response = await api.post<Item>(`/items/projects/${projectId}/items`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Item>): Promise<Item> => {
    const response = await api.put<Item>(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};

