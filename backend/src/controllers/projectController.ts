import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateProjectNumber } from '../utils/helpers';
import { WorkflowEngine } from '../services/workflowEngine';

export const getAllProjects = async (req: Request, res: Response) => {
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

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
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

    res.status(201).json(projectWithWorkflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
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

    res.json(updatedProject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const advanceWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await WorkflowEngine.advance(id, req.user.userId, comment);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const moveBackWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await WorkflowEngine.moveBack(id, req.user.userId, comment);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getWorkflowStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await WorkflowEngine.getWorkflowStatus(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

