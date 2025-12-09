import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const getAllOrganizations = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(organizations);
  } catch (error: any) {
    logger.error('Error fetching organizations:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganization = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            role: true,
          },
        },
        projects: {
          include: {
            createdBy: {
              include: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.json(organization);
  } catch (error: any) {
    logger.error('Error fetching organization:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const createOrganization = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, domain } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Check if domain is unique (if provided)
    if (domain) {
      const existingOrg = await prisma.organization.findUnique({
        where: { domain },
      });

      if (existingOrg) {
        return res.status(400).json({ error: 'Domain already in use' });
      }
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        domain: domain || null,
      },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    logger.info('Organization created', { organizationId: organization.id, name });
    return res.status(201).json(organization);
  } catch (error: any) {
    logger.error('Error creating organization:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrganization = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, domain, isActive } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if domain is unique (if provided and changed)
    if (domain && domain !== organization.domain) {
      const existingOrg = await prisma.organization.findUnique({
        where: { domain },
      });

      if (existingOrg) {
        return res.status(400).json({ error: 'Domain already in use' });
      }
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain !== undefined && { domain }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    logger.info('Organization updated', { organizationId: id });
    return res.json(updated);
  } catch (error: any) {
    logger.error('Error updating organization:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteOrganization = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Prevent deletion if organization has users or projects
    if (organization._count.users > 0 || organization._count.projects > 0) {
      return res.status(400).json({
        error: 'Cannot delete organization with users or projects. Deactivate it instead.',
      });
    }

    await prisma.organization.delete({
      where: { id },
    });

    logger.info('Organization deleted', { organizationId: id });
    return res.json({ message: 'Organization deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting organization:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const assignUserToOrganization = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId, organizationId } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User ID and Organization ID are required' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Update user's organization
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { organizationId },
      include: {
        role: true,
        organization: true,
      },
    });

    logger.info('User assigned to organization', { userId, organizationId });
    return res.json(updatedUser);
  } catch (error: any) {
    logger.error('Error assigning user to organization:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganizationUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const users = await prisma.user.findMany({
      where: { organizationId: id },
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return res.json(usersWithoutPasswords);
  } catch (error: any) {
    logger.error('Error fetching organization users:', error);
    return res.status(500).json({ error: error.message });
  }
};

