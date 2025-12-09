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

    // Get user info first (needed for multiple queries)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
      // Get user-specific recent projects (projects user has worked on or is assigned to)
      (async () => {
        if (user.role.isAdmin) {
          // Admin sees all projects sorted by most recently updated
          return await prisma.project.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
              createdBy: {
                include: { role: true },
              },
              _count: {
                select: { items: true },
              },
            },
          });
        }

        // Get projects user created or projects at stages requiring user's role
        const roleName = user.role.name;
        let whereClause: any = {
          OR: [
            { createdById: userId },
            {
              workflowSteps: {
                some: {
                  status: 'IN_PROGRESS',
                  requiredRole: roleName,
                },
              },
            },
          ],
        };

        // Special handling for Supplier
        if (roleName === 'Supplier') {
          whereClause = {
            OR: [
              { createdById: userId },
              {
                currentStage: 'Supplier Pricing',
                workflowSteps: {
                  some: {
                    status: 'IN_PROGRESS',
                    requiredRole: 'Supplier',
                  },
                },
              },
            ],
          };
        }
        // Special handling for DC Operator
        else if (roleName === 'DC Operator') {
          whereClause = {
            OR: [
              { createdById: userId },
              {
                OR: [
                  { currentStage: 'In Transition' },
                  { currentStage: 'DC Transition' },
                  { currentStage: 'DC Runout' },
                ],
                workflowSteps: {
                  some: {
                    status: 'IN_PROGRESS',
                    requiredRole: 'DC Operator',
                  },
                },
              },
            ],
          };
        }

        return await prisma.project.findMany({
          where: whereClause,
          take: 5,
          orderBy: { updatedAt: 'desc' }, // Sort by most recently updated
          include: {
            createdBy: {
              include: { role: true },
            },
            _count: {
              select: { items: true },
            },
          },
        });
      })(),
    ]);

    // Get user-specific stats
    const [pendingTasks, unreadNotifications, assignedProjects] = await Promise.all([
      TaskService.getUserTasks(userId, { status: 'PENDING', limit: 100 }),
      NotificationService.getUnreadCount(userId),
      // Get count of projects requiring user's action (same logic as My Tasks)
      (async () => {
        const userForTasks = await prisma.user.findUnique({
          where: { id: userId },
          include: { role: true },
        });

        if (!userForTasks) return [];

        // Admin sees all non-completed projects
        if (userForTasks.role.isAdmin) {
          return await prisma.project.findMany({
            where: { status: { not: 'COMPLETED' } },
            select: { id: true },
          });
        }

        const roleName = userForTasks.role.name;
        let whereClause: any = {
          status: { not: 'COMPLETED' },
        };

        // Supplier: Projects at "Supplier Pricing" stage
        if (roleName === 'Supplier') {
          whereClause = {
            ...whereClause,
            currentStage: 'Supplier Pricing',
            workflowSteps: {
              some: {
                status: 'IN_PROGRESS',
                requiredRole: 'Supplier',
              },
            },
          };
        }
        // DC Operator: Projects at "In Transition" or "DC Transition" or "DC Runout" stage
        else if (roleName === 'DC Operator') {
          whereClause = {
            ...whereClause,
            OR: [
              { currentStage: 'In Transition' },
              { currentStage: 'DC Transition' },
              { currentStage: 'DC Runout' },
            ],
            workflowSteps: {
              some: {
                status: 'IN_PROGRESS',
                requiredRole: 'DC Operator',
              },
            },
          };
        }
        // Other roles: Projects where current workflow step requires this user's role
        else {
          whereClause = {
            ...whereClause,
            workflowSteps: {
              some: {
                status: 'IN_PROGRESS',
                requiredRole: roleName,
              },
            },
          };
        }

        return await prisma.project.findMany({
          where: whereClause,
          select: { id: true },
        });
      })(),
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
      pendingTasks: assignedProjects.length, // Use project count instead of task count to match My Tasks
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

