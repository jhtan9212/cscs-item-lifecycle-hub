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
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  static async getUserNotifications(
    userId: string,
    options?: { limit?: number; offset?: number; unreadOnly?: boolean }
  ) {
    const { limit = 50, offset = 0, unreadOnly = false } = options || {};

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }
}

