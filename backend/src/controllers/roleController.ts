import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllRoles = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.json(roles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    return res.json(role);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllPermissions = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return res.json(permissions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateRolePermissions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // Array of { permissionId, granted }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    // Delete all existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Create new permissions
    await Promise.all(
      permissions.map((perm: { permissionId: string; granted: boolean }) =>
        prisma.rolePermission.create({
          data: {
            roleId: id,
            permissionId: perm.permissionId,
            granted: perm.granted,
          },
        })
      )
    );

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return res.json(role);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

