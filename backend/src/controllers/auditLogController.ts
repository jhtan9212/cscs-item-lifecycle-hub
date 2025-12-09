import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAuditLogs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectId, userId, action, entityType, startDate, endDate, limit, offset } = req.query;

    // Build where clause
    const where: any = {};

    if (projectId) {
      where.projectId = projectId as string;
    }

    if (userId) {
      where.userId = userId as string;
    }

    if (action) {
      where.action = action as string;
    }

    if (entityType) {
      where.entityType = entityType as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const limitNum = limit ? parseInt(limit as string) : 50;
    const offsetNum = offset ? parseInt(offset as string) : 0;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: {
                select: {
                  name: true,
                },
              },
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
        orderBy: {
          createdAt: 'desc',
        },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      auditLogs,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAuditLog = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                name: true,
              },
            },
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

    if (!auditLog) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    return res.json(auditLog);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAuditLogFilters = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Get distinct values for filters
    const [actions, entityTypes, users] = await Promise.all([
      prisma.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      }),
      prisma.auditLog.findMany({
        select: { entityType: true },
        distinct: ['entityType'],
        orderBy: { entityType: 'asc' },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return res.json({
      actions: actions.map((a) => a.action),
      entityTypes: entityTypes.map((e) => e.entityType),
      users,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

