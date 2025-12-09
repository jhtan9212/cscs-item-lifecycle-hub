import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const getUserNotifications = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { unreadOnly, limit, offset } = req.query;

    // Validate and parse query parameters safely
    let parsedLimit: number | undefined;
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 1000) {
        parsedLimit = limitNum;
      }
    }

    let parsedOffset: number | undefined;
    if (offset) {
      const offsetNum = parseInt(offset as string, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        parsedOffset = offsetNum;
      }
    }

    const notifications = await NotificationService.getUserNotifications(
      req.user.userId,
      {
        unreadOnly: unreadOnly === 'true',
        limit: parsedLimit,
        offset: parsedOffset,
      }
    );

    // Map 'read' field to 'isRead' for frontend compatibility
    // Also ensure title field is present (use message if title is missing for backward compatibility)
    const mappedNotifications = notifications.map(n => ({
      ...n,
      isRead: n.read,
      title: n.title || (n.message ? n.message.substring(0, 50) : 'Notification'), // Safe fallback
    }));

    return res.json(mappedNotifications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const count = await NotificationService.getUnreadCount(req.user.userId);
    return res.json({ count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    await NotificationService.markAsRead(id, req.user.userId);
    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await NotificationService.markAllAsRead(req.user.userId);
    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

