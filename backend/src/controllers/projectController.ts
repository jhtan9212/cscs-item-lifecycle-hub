import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateProjectNumber } from '../utils/helpers';
import { WorkflowEngine } from '../services/workflowEngine';

export const getAllProjects = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
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

    // Check if user has VIEW_OWN_PROJECTS and if this project is assigned to them
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has VIEW_PROJECT or is admin, allow access
    if (req.user.isAdmin) {
      return res.json(project);
    }

    // Check if user has VIEW_OWN_PROJECTS permission
    const hasViewOwnProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_OWN_PROJECTS',
        },
        granted: true,
      },
    });

    // If user has VIEW_OWN_PROJECTS, check if project is assigned to them
    if (hasViewOwnProjects) {
      const currentStep = project.workflowSteps.find(s => s.status === 'IN_PROGRESS');
      if (currentStep && currentStep.requiredRole === user.role.name) {
        return res.json(project);
      }
    }

    // Check if user has VIEW_PROJECT permission
    const hasViewProject = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_PROJECT',
        },
        granted: true,
      },
    });

    if (hasViewProject) {
      return res.json(project);
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

    // Use authenticated user or throw error
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;

    const projectNumber = generateProjectNumber();

    const project = await prisma.project.create({
      data: {
        projectNumber,
        name,
        description,
        lifecycleType: lifecycleType || 'NEW_ITEM',
        status: 'DRAFT',
        currentStage: 'Draft',
        createdById: userId,
        items: items
          ? {
              create: items.map((item: any) => ({
                name: item.name,
                description: item.description,
                category: item.category,
                ownedByCategoryManager: true, // Default ownership
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

    // Initialize workflow
    await WorkflowEngine.initializeWorkflow(project.id, project.lifecycleType);

    // Create audit log
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
        items: true,
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: id,
        userId: project.createdById,
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
    const result = await WorkflowEngine.getWorkflowStatus(id);
    return res.json(result);
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
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin sees all non-completed projects
    if (user.role.isAdmin) {
      const projects = await prisma.project.findMany({
        where: { status: { not: 'COMPLETED' } },
        include: {
          createdBy: {
            include: {
              role: true,
            },
          },
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

    // Build where clause based on role
    let whereClause: any = {
      status: {
        not: 'COMPLETED',
      },
    };

    // Supplier: Projects at "Supplier Pricing" stage
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
    }
    // DC Operator: Projects at "In Transition" or "DC Transition" or "DC Runout" stage
    else if (roleName === 'DC Operator') {
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
    }
    // Other roles: Projects where current workflow step requires this user's role
    else {
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

    // Get projects based on role-specific criteria
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        createdBy: {
          include: {
            role: true,
          },
        },
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

