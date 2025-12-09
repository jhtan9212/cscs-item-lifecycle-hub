import api from './api';
import { projectService } from './projectService';
import { notificationService } from './notificationService';
import { taskService } from './taskService';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalItems: number;
  pendingTasks: number;
  unreadNotifications: number;
  projectsByStatus: Record<string, number>;
  projectsByLifecycle: Record<string, number>;
  recentProjects: any[];
  recentTasks: any[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Fallback: calculate from existing APIs
      const projects = await projectService.getAll();
      const unreadCount = await notificationService.getUnreadCount();
      const tasks = await taskService.getAll().catch(() => []);

      const totalProjects = projects.length;
      const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
      const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
      const totalItems = projects.reduce((sum, p) => sum + (p.items?.length || 0), 0);
      const pendingTasks = tasks.filter((t: any) => t.status === 'PENDING').length;

      const projectsByStatus: Record<string, number> = {};
      const projectsByLifecycle: Record<string, number> = {};

      projects.forEach((p) => {
        projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
        projectsByLifecycle[p.lifecycleType] = (projectsByLifecycle[p.lifecycleType] || 0) + 1;
      });

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalItems,
        pendingTasks,
        unreadNotifications: unreadCount,
        projectsByStatus,
        projectsByLifecycle,
        recentProjects: projects.slice(0, 5),
        recentTasks: tasks.slice(0, 5),
      };
    }
  },
};
