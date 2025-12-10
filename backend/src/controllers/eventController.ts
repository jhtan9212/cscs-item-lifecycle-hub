import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import prisma from '../config/database';
import { EventStatus } from '@prisma/client';

export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { entityType, entityId, eventType, status, limit = 50 } = req.query;

    // If entityType and entityId are provided, use getEntityEvents
    if (entityType && entityId) {
      const events = await EventService.getEntityEvents(
        entityType as string,
        entityId as string,
        parseInt(limit as string, 10)
      );
      return res.json(events);
    }

    // Otherwise, get all events with filters
    const whereClause: any = {};
    
    if (eventType) {
      whereClause.eventType = eventType as string;
    }
    
    if (status) {
      // Validate status is a valid EventStatus enum value
      const validStatuses = Object.values(EventStatus);
      if (validStatuses.includes(status as EventStatus)) {
        whereClause.status = status as EventStatus;
      }
    }
    
    if (entityType) {
      whereClause.entityType = entityType as string;
    }
    
    if (entityId) {
      whereClause.entityId = entityId as string;
    }

    const events = await prisma.lifecycleEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
    });

    return res.json(events);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const event = await prisma.lifecycleEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getEventFilters = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [eventTypes, entityTypes, statuses] = await Promise.all([
      prisma.lifecycleEvent.findMany({
        select: { eventType: true },
        distinct: ['eventType'],
      }),
      prisma.lifecycleEvent.findMany({
        select: { entityType: true },
        distinct: ['entityType'],
      }),
      prisma.lifecycleEvent.findMany({
        select: { status: true },
        distinct: ['status'],
      }),
    ]);

    return res.json({
      eventTypes: eventTypes.map((e) => e.eventType),
      entityTypes: entityTypes.map((e) => e.entityType),
      statuses: statuses.map((e) => e.status),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

