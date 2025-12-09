import api from './api';
import type { Comment } from '../types/project';

export const commentService = {
  getByProject: async (projectId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/projects/${projectId}/comments`);
    return response.data;
  },

  create: async (projectId: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/projects/${projectId}/comments`, {
      content,
    });
    return response.data;
  },
};
