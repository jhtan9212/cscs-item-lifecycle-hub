import api from './api';

export interface AuditLog {
  id: string;
  projectId?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: {
      name: string;
    };
  };
  project?: {
    id: string;
    name: string;
    projectNumber: string;
  };
}

export interface AuditLogFilters {
  projectId?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  auditLogs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilterOptions {
  actions: string[];
  entityTypes: string[];
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export const auditLogService = {
  getAll: async (filters?: AuditLogFilters): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<AuditLogResponse>(`/audit-logs?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<AuditLog> => {
    const response = await api.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },

  getFilters: async (): Promise<FilterOptions> => {
    const response = await api.get<FilterOptions>('/audit-logs/filters');
    return response.data;
  },
};
