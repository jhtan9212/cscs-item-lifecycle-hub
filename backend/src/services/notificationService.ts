import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedProjectId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export class NotificationService {
  static async create(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          relatedProjectId: params.relatedProjectId,
          relatedEntityType: params.relatedEntityType,
          relatedEntityId: params.relatedEntityId,
        },
      });

      return notification;
    } catch (error: any) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createForRole(
    roleName: string,
    params: Omit<CreateNotificationParams, 'userId'>
  ) {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: {
            name: roleName,
          },
          isActive: true,
        },
      });

      const notifications = await Promise.all(
        users.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              ...params,
            },
          })
        )
      );

      return notifications;
    } catch (error: any) {
      logger.error('Error creating notifications for role:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }

    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error: any) {
      logger.error('Error getting unread count:', {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  static async getUserNotifications(
    userId: string,
    options?: { limit?: number; offset?: number; unreadOnly?: boolean }
  ) {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }

    // Validate and sanitize options to prevent invalid queries
    const limit = options?.limit && options.limit > 0 && options.limit <= 1000 
      ? options.limit 
      : 50;
    const offset = options?.offset && options.offset >= 0 
      ? options.offset 
      : 0;
    const unreadOnly = options?.unreadOnly || false;

    try {
      return await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { read: false }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          type: true,
          title: true,
          message: true,
          read: true,
          readAt: true,
          relatedProjectId: true,
          relatedEntityType: true,
          relatedEntityId: true,
          createdAt: true,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching user notifications:', {
        userId,
        limit,
        offset,
        unreadOnly,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

