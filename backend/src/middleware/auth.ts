import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import prisma from '../config/database';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        id: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Attach user info to request
    req.user = {
      ...decoded,
      id: user.id,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid token' });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (user && user.isActive) {
        req.user = {
          ...decoded,
          id: user.id,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

