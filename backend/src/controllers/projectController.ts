import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateProjectNumber } from '../utils/helpers';
import { WorkflowEngine } from '../services/workflowEngine';
import { VersionService } from '../services/versionService';
import { EventService } from '../services/eventService';

export const getAllProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasViewAllProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_ALL_PROJECTS',
        },
        granted: true,
      },
    });

    const hasViewProject = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_PROJECT',
        },
        granted: true,
      },
    });

    const hasViewOwnProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_OWN_PROJECTS',
        },
        granted: true,
      },
    });

    if (hasViewOwnProjects && !hasViewAllProjects && !hasViewProject) {
      const roleName = user.role.name;
      let whereClause: any = {};
      
      if (user.organizationId) {
        whereClause.organizationId = user.organizationId;
      } else {
        whereClause.organizationId = null;
      }

      if (roleName === 'Supplier') {
        whereClause.currentStage = 'Supplier Pricing';
        whereClause.workflowSteps = {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: 'Supplier',
          },
        };
      } else if (roleName === 'DC Operator') {
        whereClause.OR = [
          { currentStage: 'In Transition' },
          { currentStage: 'DC Transition' },
          { currentStage: 'DC Runout' },
        ];
        whereClause.workflowSteps = {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: 'DC Operator',
          },
        };
      } else {
        whereClause.workflowSteps = {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: roleName,
          },
        };
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          createdBy: {
            include: {
              role: true,
            },
          },
          organization: true,
          items: true,
          workflowSteps: {
            orderBy: { stepOrder: 'asc' },
          },
          _count: {
            select: {
              items: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(projects);
    }

    const where: any = {};
    
    if (!user.role.isAdmin) {
      if (user.organizationId) {
        where.organizationId = user.organizationId;
      } else {
        where.organizationId = null;
      }
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        organization: true,
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            items: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(projects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        organization: true,
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.isAdmin || user.role.isAdmin) {
      return res.json(project);
    }

    const hasViewAllProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_ALL_PROJECTS',
        },
        granted: true,
      },
    });

    const hasViewProject = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_PROJECT',
        },
        granted: true,
      },
    });

    if (hasViewAllProjects || hasViewProject) {
      if (user.organizationId && project.organizationId) {
        if (project.organizationId !== user.organizationId) {
          return res.status(403).json({
            error: 'You do not have permission to view this project',
          });
        }
      } else if (user.organizationId && !project.organizationId) {
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      } else if (!user.organizationId && project.organizationId) {
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      }
      return res.json(project);
    }

    const hasViewOwnProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_OWN_PROJECTS',
        },
        granted: true,
      },
    });

    if (hasViewOwnProjects) {
      if (user.organizationId && project.organizationId) {
        if (project.organizationId !== user.organizationId) {
          return res.status(403).json({
            error: 'You do not have permission to view this project',
          });
        }
      } else if (user.organizationId && !project.organizationId) {
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      } else if (!user.organizationId && project.organizationId) {
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      }

      // Then check if project is assigned to user's role
      const currentStep = project.workflowSteps.find((s: { status: string; requiredRole: string | null }) => s.status === 'IN_PROGRESS');
      if (currentStep && currentStep.requiredRole === user.role.name) {
        return res.json(project);
      }
    }

    // User doesn't have permission to view this project
    return res.status(403).json({
      error: 'You do not have permission to view this project',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description, lifecycleType, items } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    const projectNumber = generateProjectNumber();

    const project = await prisma.project.create({
      data: {
        projectNumber,
        name,
        description,
        lifecycleType: lifecycleType || 'NEW_ITEM',
        status: 'IN_PROGRESS',
        currentStage: 'Draft',
        createdById: userId,
        organizationId: user?.organizationId || null,
        items: items
          ? {
              create: items.map((item: any) => ({
                name: item.name,
                description: item.description,
                category: item.category,
                ownedByCategoryManager: true,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        items: true,
      },
    });

    await WorkflowEngine.initializeWorkflow(project.id, project.lifecycleType);

    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userId,
        action: 'CREATE_PROJECT',
        entityType: 'PROJECT',
        entityId: project.id,
      },
    });

    const projectWithWorkflow = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        organization: true,
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return res.status(201).json(projectWithWorkflow);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, lifecycleType, status } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        lifecycleType,
        status,
      },
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        organization: true,
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (req.user) {
      try {
        await VersionService.createProjectVersion(id, req.user.userId);
      } catch (error) {
        console.error('Error creating project version:', error);
      }

      try {
        await EventService.createEvent('PROJECT_UPDATED', {
          entityType: 'PROJECT',
          entityId: id,
          action: 'UPDATE',
          userId: req.user.userId,
          data: {
            changes: { name, description, lifecycleType, status },
          },
        });
      } catch (error) {
        console.error('Error creating lifecycle event:', error);
      }
    }

    await prisma.auditLog.create({
      data: {
        projectId: id,
        userId: req.user?.userId || project.createdById,
        action: 'UPDATE_PROJECT',
        entityType: 'PROJECT',
        entityId: id,
        changes: JSON.stringify({ name, description, lifecycleType, status }),
      },
    });

    return res.json(updatedProject);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id },
    });

    return res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const advanceWorkflow = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await WorkflowEngine.advance(id, req.user.userId, comment);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const moveBackWorkflow = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await WorkflowEngine.moveBack(id, req.user.userId, comment);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getWorkflowStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await WorkflowEngine.getWorkflowStatus(id);
    
    const canAdvanceResult = await WorkflowEngine.canAdvance(id, req.user.userId);
    const canMoveBackResult = await WorkflowEngine.canMoveBack(id, req.user.userId);
    
    return res.json({
      ...result,
      canAdvance: canAdvanceResult.canAdvance,
      canAdvanceReason: canAdvanceResult.reason,
      canMoveBack: canMoveBackResult.canMoveBack,
      canMoveBackReason: canMoveBackResult.reason,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMyAssignedProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true, organization: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasViewAllProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_ALL_PROJECTS',
        },
        granted: true,
      },
    });

    const orgFilter: any = {};
    if (!user.role.isAdmin) {
      if (user.organizationId) {
        orgFilter.organizationId = user.organizationId;
      } else {
        orgFilter.organizationId = null;
      }
    }

    if (user.role.isAdmin || hasViewAllProjects) {
      const projects = await prisma.project.findMany({
        where: { ...orgFilter, status: { not: 'COMPLETED' } },
        include: {
          createdBy: {
            include: {
              role: true,
            },
          },
          organization: true,
          items: true,
          workflowSteps: {
            orderBy: { stepOrder: 'asc' },
          },
          _count: {
            select: {
              items: true,
              comments: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      return res.json(projects);
    }

    const roleName = user.role.name;

    let whereClause: any = {
      ...orgFilter,
      status: {
        not: 'COMPLETED',
      },
    };

    if (roleName === 'Supplier') {
      whereClause = {
        ...whereClause,
        currentStage: 'Supplier Pricing',
        workflowSteps: {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: 'Supplier',
          },
        },
      };
    } else if (roleName === 'DC Operator') {
      whereClause = {
        ...whereClause,
        OR: [
          { currentStage: 'In Transition' },
          { currentStage: 'DC Transition' },
          { currentStage: 'DC Runout' },
        ],
        workflowSteps: {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: 'DC Operator',
          },
        },
      };
    } else {
      whereClause = {
        ...whereClause,
        workflowSteps: {
          some: {
            status: 'IN_PROGRESS',
            requiredRole: roleName,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
        organization: true,
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            items: true,
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.json(projects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

