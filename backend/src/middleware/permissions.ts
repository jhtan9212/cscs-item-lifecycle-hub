import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const checkPermission = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Admin always has all permissions
      if (req.user.isAdmin) {
        next();
        return;
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
        res.status(403).json({
          error: 'Insufficient permissions',
          required: permissionName,
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  };
};

// Check for any of the provided permissions
export const checkAnyPermission = (...permissionNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Admin always has all permissions
      if (req.user.isAdmin) {
        next();
        return;
      }

      // Check if user has any of the required permissions
      const rolePermissions = await prisma.rolePermission.findMany({
        where: {
          roleId: req.user.roleId,
          permission: {
            name: {
              in: permissionNames,
            },
          },
          granted: true,
        },
        include: {
          permission: true,
        },
      });

      if (rolePermissions.length === 0) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: permissionNames,
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  };
};

export const checkRole = (...roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Admin can access everything
      if (req.user.isAdmin) {
        next();
        return;
      }

      if (!roleNames.includes(req.user.roleName)) {
        res.status(403).json({
          error: 'Insufficient role permissions',
          required: roleNames,
          current: req.user.roleName,
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  };
};

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.user.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
};
