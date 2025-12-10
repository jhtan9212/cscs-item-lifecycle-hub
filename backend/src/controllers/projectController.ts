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

    // Get user to check if admin and permissions
    // organizationId is a direct field on User model, so it's automatically included
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has VIEW_ALL_PROJECTS, VIEW_PROJECT, or VIEW_OWN_PROJECTS permission
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

    // If user only has VIEW_OWN_PROJECTS, show only projects assigned to their role
    if (hasViewOwnProjects && !hasViewAllProjects && !hasViewProject) {
      const roleName = user.role.name;
      let whereClause: any = {};
      
      // Apply organization filter
      if (user.organizationId) {
        whereClause.organizationId = user.organizationId;
      } else {
        whereClause.organizationId = null;
      }

      // Filter by role-specific stage requirements
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
        // Other roles: Projects where current workflow step requires this user's role
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

    // Build where clause - filter by organization unless admin
    // ALL non-admin users (including those with VIEW_PROJECT) must be filtered by organization
    // Only admins and users with VIEW_ALL_PROJECTS can see all projects (but still filtered by org for non-admins)
    const where: any = {};
    
    // Always filter by organization for non-admin users
    // VIEW_ALL_PROJECTS allows seeing all projects WITHIN their organization, not across organizations
    if (!user.role.isAdmin) {
      // Non-admin users see only their organization's projects
      // If user has no organization, they see projects with no organization
      if (user.organizationId) {
        where.organizationId = user.organizationId;
      } else {
        // User without organization sees projects without organization
        where.organizationId = null;
      }
    }
    // Admins see all projects (no organization filter)

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

    // Check if user has VIEW_OWN_PROJECTS and if this project is assigned to them
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is admin, allow access
    if (req.user.isAdmin || user.role.isAdmin) {
      return res.json(project);
    }

    // Check if user has VIEW_ALL_PROJECTS permission (allows seeing all projects in their org)
    const hasViewAllProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_ALL_PROJECTS',
        },
        granted: true,
      },
    });

    // Check if user has VIEW_PROJECT permission (allows seeing projects in their org)
    const hasViewProject = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_PROJECT',
        },
        granted: true,
      },
    });

    // If user has VIEW_ALL_PROJECTS or VIEW_PROJECT, check organization match
    if (hasViewAllProjects || hasViewProject) {
      // Organization check: Non-admin users can only access projects from their organization
      // Handle cases where user or project has no organization
      if (user.organizationId && project.organizationId) {
        // Both have organization - must match
        if (project.organizationId !== user.organizationId) {
          return res.status(403).json({
            error: 'You do not have permission to view this project',
          });
        }
      } else if (user.organizationId && !project.organizationId) {
        // User has org but project doesn't - not allowed
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      } else if (!user.organizationId && project.organizationId) {
        // User has no org but project does - not allowed
        return res.status(403).json({
          error: 'You do not have permission to view this project',
        });
      }
      // Both have no organization or both match - allow access
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
      // First check organization match
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
      const currentStep = project.workflowSteps.find(s => s.status === 'IN_PROGRESS');
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

    // Use authenticated user or throw error
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;

    // Get user to get organizationId
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
        status: 'IN_PROGRESS', // Set to IN_PROGRESS when workflow is initialized
        currentStage: 'Draft',
        createdById: userId,
        organizationId: user?.organizationId || null,
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

    // Create project version snapshot before update
    if (req.user) {
      try {
        await VersionService.createProjectVersion(id, req.user.userId);
      } catch (error) {
        console.error('Error creating project version:', error);
        // Don't fail project update if version creation fails
      }

      // Create lifecycle event for project update
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
        // Don't fail project update if event creation fails
      }
    }

    // Create audit log
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
    
    // Also check if user can advance/move back
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

    // Check if user has VIEW_ALL_PROJECTS permission
    const hasViewAllProjects = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: {
          name: 'VIEW_ALL_PROJECTS',
        },
        granted: true,
      },
    });

    // Build organization filter - ALL non-admin users must be filtered by organization
    // VIEW_ALL_PROJECTS means "all projects within their organization", not "all projects across all organizations"
    const orgFilter: any = {};
    if (!user.role.isAdmin) {
      // ALL non-admin users see only their organization's projects
      // If user has no organization, they see projects with no organization
      if (user.organizationId) {
        orgFilter.organizationId = user.organizationId;
      } else {
        // User without organization sees projects without organization
        orgFilter.organizationId = null;
      }
    }

    // Admin sees all non-completed projects (no organization filter)
    // Users with VIEW_ALL_PROJECTS see all non-completed projects within their organization
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

    // Build where clause based on role (with organization filter)
    let whereClause: any = {
      ...orgFilter, // Apply organization filter
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

