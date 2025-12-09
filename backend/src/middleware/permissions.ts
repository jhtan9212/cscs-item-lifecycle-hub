import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const checkPermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Admin always has all permissions
      if (req.user.isAdmin) {
        return next();
      }

      // Check if user's role has the required permission
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: req.user.roleId,
          permission: {
            name: permissionName,
          },
          granted: true,
        },
        include: {
          permission: true,
        },
      });

      if (!rolePermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permissionName,
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
};

export const checkRole = (...roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Admin can access everything
      if (req.user.isAdmin) {
        return next();
      }

      if (!roleNames.includes(req.user.roleName)) {
        return res.status(403).json({
          error: 'Insufficient role permissions',
          required: roleNames,
          current: req.user.roleName,
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
};

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

