import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../utils/auth';

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Get user to check if admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { role: true },
    });

    // Build where clause - filter by organization unless admin
    const where: any = {};
    if (!currentUser?.role.isAdmin && currentUser?.organizationId) {
      where.organizationId = currentUser.organizationId;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return res.json(usersWithoutPasswords);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, email, roleId, isActive } = req.body;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is being changed, check for duplicates
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // If roleId is being changed, verify role exists
    if (roleId && roleId !== existingUser.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, roleId, organizationId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Get current user to determine organization
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { role: true },
    });

    // Non-admin users can only create users in their organization
    let finalOrganizationId = organizationId;
    if (!currentUser?.role.isAdmin) {
      finalOrganizationId = currentUser?.organizationId || null;
    }

    // Verify organization exists if provided
    if (finalOrganizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: finalOrganizationId },
      });
      if (!org) {
        return res.status(400).json({ error: 'Invalid organization ID' });
      }
    }

    // Verify role exists
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
    } else {
      const role = await prisma.role.findUnique({
        where: { id: finalRoleId },
      });
      if (!role) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: finalRoleId,
        organizationId: finalOrganizationId || null,
        isActive: true,
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
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deactivateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating yourself
    if (req.user && req.user.userId === id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const activateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

