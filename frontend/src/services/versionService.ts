import api from './api';

export interface ItemVersion {
  id: string;
  itemId: string;
  versionNumber: number;
  data: string; // JSON string
  createdAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  data: string; // JSON string
  createdAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export const versionService = {
  getItemVersions: async (itemId: string): Promise<ItemVersion[]> => {
    const response = await api.get<ItemVersion[]>(`/versions/items/${itemId}/versions`);
    return response.data;
  },

  getItemVersion: async (itemId: string, versionNumber: number): Promise<ItemVersion> => {
    const response = await api.get<ItemVersion>(
      `/versions/items/${itemId}/versions/${versionNumber}`
    );
    return response.data;
  },

  getProjectVersions: async (projectId: string): Promise<ProjectVersion[]> => {
    const response = await api.get<ProjectVersion[]>(`/versions/projects/${projectId}/versions`);
    return response.data;
  },

  getProjectVersion: async (
    projectId: string,
    versionNumber: number
  ): Promise<ProjectVersion> => {
    const response = await api.get<ProjectVersion>(
      `/versions/projects/${projectId}/versions/${versionNumber}`
    );
    return response.data;
  },
};

