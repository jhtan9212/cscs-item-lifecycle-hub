import api from './api';

export interface Task {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description?: string;
  assignedToId?: string;
  assignedRole?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    projectNumber: string;
  };
}

export const taskService = {
  getAll: async (options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks/project/${projectId}`);
    return response.data;
  },

  create: async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  getUserTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks/user');
    return response.data;
  },

  completeTask: async (id: string): Promise<Task> => {
    const response = await api.post<Task>(`/tasks/${id}/complete`);
    return response.data;
  },
};
