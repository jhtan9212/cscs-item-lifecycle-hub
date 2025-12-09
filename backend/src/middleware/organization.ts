import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware to filter queries by organization
 * Adds organizationId to request for use in controllers
 */
export const organizationFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { 
        role: true,
        organization: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Admin can see all organizations (no filter)
    // Other users are scoped to their organization
    if (user.role.isAdmin) {
      // Admin: no organization filter
      req.organizationId = undefined;
    } else {
      // Non-admin: filter by organization
      req.organizationId = user.organizationId || undefined;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Extend Express Request to include organizationId
declare global {
  namespace Express {
    interface Request {
      organizationId?: string | undefined;
    }
  }
}

