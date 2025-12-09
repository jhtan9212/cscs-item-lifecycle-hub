import { Request, Response } from 'express';
import prisma from '../config/database';
import { NotificationService } from '../services/notificationService';
import { TaskService } from '../services/taskService';

export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;

    // Get project statistics
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalItems,
      projectsByStatus,
      projectsByLifecycle,
      recentProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.item.count(),
      prisma.project.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ['lifecycleType'],
        _count: true,
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            include: { role: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    // Get user-specific stats
    const [pendingTasks, unreadNotifications] = await Promise.all([
      TaskService.getUserTasks(userId, { status: 'PENDING', limit: 100 }),
      NotificationService.getUnreadCount(userId),
    ]);

    // Format grouped data
    const statusCounts: Record<string, number> = {};
    projectsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count;
    });

    const lifecycleCounts: Record<string, number> = {};
    projectsByLifecycle.forEach((item) => {
      lifecycleCounts[item.lifecycleType] = item._count;
    });

    return res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      totalItems,
      pendingTasks: pendingTasks.length,
      unreadNotifications,
      projectsByStatus: statusCounts,
      projectsByLifecycle: lifecycleCounts,
      recentProjects,
      recentTasks: pendingTasks.slice(0, 5),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

