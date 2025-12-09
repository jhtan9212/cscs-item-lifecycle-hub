import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get default role if not provided (Category Manager)
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'Category Manager' },
      });
      if (defaultRole) {
        finalRoleId = defaultRole.id;
      } else {
        return res.status(400).json({ error: 'No default role found' });
      }
    }

    // Create user (registration doesn't assign organization - can be done later by admin)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId: finalRoleId,
        organizationId: null, // New registrations don't get organization automatically
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isAdmin: user.role.isAdmin,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User registered: ${user.email}`);

    return res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isAdmin: user.role.isAdmin,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    return res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

