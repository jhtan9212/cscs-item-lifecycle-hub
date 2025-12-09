import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface CreateTaskParams {
  projectId: string;
  type: string;
  title: string;
  description?: string;
  assignedToId?: string;
  assignedRole?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  metadata?: any;
}

export class TaskService {
  static async create(params: CreateTaskParams) {
    try {
      const task = await prisma.task.create({
        data: {
          projectId: params.projectId,
          type: params.type,
          title: params.title,
          description: params.description,
          assignedToId: params.assignedToId,
          assignedRole: params.assignedRole,
          priority: params.priority || 'MEDIUM',
          dueDate: params.dueDate,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
        include: {
          assignedTo: {
            include: {
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              projectNumber: true,
            },
          },
        },
      });

      return task;
    } catch (error: any) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  static async assignToUser(taskId: string, userId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: userId,
        status: 'PENDING',
      },
    });
  }

  static async completeTask(taskId: string, userId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedById: userId,
      },
    });
  }

  static async getUserTasks(
    userId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ) {
    const { status, limit = 50, offset = 0 } = options || {};

    return prisma.task.findMany({
      where: {
        assignedToId: userId,
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  static async getProjectTasks(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async updateTaskStatus(
    taskId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE'
  ) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}

