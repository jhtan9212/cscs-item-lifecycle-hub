import api from './api';

export interface LifecycleEvent {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload: string; // JSON string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  createdAt: Date;
  processedAt?: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventFilters {
  eventTypes: string[];
  entityTypes: string[];
  statuses: string[];
}

export const eventService = {
  getAll: async (params?: {
    entityType?: string;
    entityId?: string;
    eventType?: string;
    status?: string;
    limit?: number;
  }): Promise<LifecycleEvent[]> => {
    const response = await api.get<LifecycleEvent[]>('/events', { params });
    return response.data;
  },

  getById: async (id: string): Promise<LifecycleEvent> => {
    const response = await api.get<LifecycleEvent>(`/events/${id}`);
    return response.data;
  },

  getFilters: async (): Promise<EventFilters> => {
    const response = await api.get<EventFilters>('/events/filters');
    return response.data;
  },
};

