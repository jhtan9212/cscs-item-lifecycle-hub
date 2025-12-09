import api from './api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedProjectId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export const notificationService = {
  getAll: async (options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get<Notification[]>(`/notifications?${params.toString()}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read/all');
  },
};
