import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { unreadOnly, limit, offset } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      req.user.userId,
      {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      }
    );

    // Map 'read' field to 'isRead' for frontend compatibility
    // Also ensure title field is present (use message if title is missing for backward compatibility)
    const mappedNotifications = notifications.map(n => ({
      ...n,
      isRead: n.read,
      title: n.title || n.message.substring(0, 50), // Fallback to message if title missing
    }));

    res.json(mappedNotifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const count = await NotificationService.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    await NotificationService.markAsRead(id, req.user.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await NotificationService.markAllAsRead(req.user.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

