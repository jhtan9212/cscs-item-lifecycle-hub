import prisma from '../config/database';
import { LifecycleType, StepStatus } from '@prisma/client';
import { NotificationService } from './notificationService';
import { TaskService } from './taskService';
import { VersionService } from './versionService';
import { EventService } from './eventService';
import { logger } from '../utils/logger';

// Workflow stage definitions
const WORKFLOW_STAGES = {
  NEW_ITEM: [
    { name: 'Draft', order: 1, requiredRole: 'Category Manager', description: 'Initial project creation' },
    { name: 'Freight Strategy', order: 2, requiredRole: 'Logistics', description: 'Logistics analysis' },
    { name: 'Supplier Pricing', order: 3, requiredRole: 'Supplier', description: 'Supplier quotes' },
    { name: 'KINEXO Pricing', order: 4, requiredRole: 'Pricing Specialist', description: 'Internal pricing' },
    { name: 'CM Approval', order: 5, requiredRole: 'Category Manager', description: 'Category Manager review' },
    { name: 'SSM Approval', order: 6, requiredRole: 'Strategic Supply Manager', description: 'Strategic Supply review' },
    { name: 'In Transition', order: 7, requiredRole: 'DC Operator', description: 'DC setup' },
    { name: 'Completed', order: 8, requiredRole: null, description: 'Project complete' },
  ],
  TRANSITIONING_ITEM: [
    { name: 'Draft', order: 1, requiredRole: 'Category Manager', description: 'Initial transition project creation' },
    { name: 'Item Comparison', order: 2, requiredRole: 'Category Manager', description: 'Compare old vs new item specs' },
    { name: 'Freight Strategy', order: 3, requiredRole: 'Logistics', description: 'Updated logistics requirements' },
    { name: 'Supplier Pricing', order: 4, requiredRole: 'Supplier', description: 'New supplier pricing' },
    { name: 'KINEXO Pricing', order: 5, requiredRole: 'Pricing Specialist', description: 'Internal pricing update' },
    { name: 'CM Approval', order: 6, requiredRole: 'Category Manager', description: 'Category Manager review' },
    { name: 'SSM Approval', order: 7, requiredRole: 'Strategic Supply Manager', description: 'Strategic Supply review' },
    { name: 'DC Transition', order: 8, requiredRole: 'DC Operator', description: 'DC transition execution' },
    { name: 'Completed', order: 9, requiredRole: null, description: 'Transition complete' },
  ],
  DELETING_ITEM: [
    { name: 'Draft', order: 1, requiredRole: 'Category Manager', description: 'Deletion request' },
    { name: 'Impact Analysis', order: 2, requiredRole: 'Category Manager', description: 'Assess deletion impact' },
    { name: 'SSM Review', order: 3, requiredRole: 'Strategic Supply Manager', description: 'Strategic Supply review' },
    { name: 'DC Runout', order: 4, requiredRole: 'DC Operator', description: 'Manage inventory runout' },
    { name: 'Archive', order: 5, requiredRole: 'Admin', description: 'Archive item data' },
    { name: 'Completed', order: 6, requiredRole: null, description: 'Deletion complete' },
  ],
};

export class WorkflowEngine {
  static getStagesForLifecycle(lifecycleType: LifecycleType) {
    return WORKFLOW_STAGES[lifecycleType] || WORKFLOW_STAGES.NEW_ITEM;
  }

  static async initializeWorkflow(projectId: string, lifecycleType: LifecycleType) {
    const stages = this.getStagesForLifecycle(lifecycleType);
    
    const workflowSteps = await Promise.all(
      stages.map((stage) =>
        prisma.workflowStep.create({
          data: {
            projectId,
            stepName: stage.name,
            stepOrder: stage.order,
            status: stage.order === 1 ? StepStatus.IN_PROGRESS : StepStatus.PENDING,
            requiredRole: stage.requiredRole,
            description: stage.description,
          },
        })
      )
    );

    return workflowSteps;
  }

  static async getCurrentStep(projectId: string) {
    const currentStep = await prisma.workflowStep.findFirst({
      where: {
        projectId,
        status: StepStatus.IN_PROGRESS,
      },
      orderBy: {
        stepOrder: 'asc',
      },
    });

    return currentStep;
  }

  static async canAdvance(projectId: string, userId: string): Promise<{ canAdvance: boolean; reason?: string }> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workflowSteps: {
          orderBy: { stepOrder: 'asc' },
        },
        createdBy: {
          include: { role: true },
        },
        organization: true,
      },
    });

    if (!project) {
      return { canAdvance: false, reason: 'Project not found' };
    }

    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      return { canAdvance: false, reason: 'No active workflow step found' };
    }

    if (currentStep.status !== StepStatus.COMPLETED && currentStep.status !== StepStatus.IN_PROGRESS) {
      return { canAdvance: false, reason: 'Current step must be in progress or completed' };
    }

    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const isFinalStage = currentStep.stepOrder >= stages.length;
    if (isFinalStage) {
      return { canAdvance: false, reason: 'Already at final stage' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return { canAdvance: false, reason: 'User not found' };
    }

    if (user.role.isAdmin) {
      return { canAdvance: true };
    }

    if (user.organizationId && project.organizationId) {
      if (project.organizationId !== user.organizationId) {
        return {
          canAdvance: false,
          reason: 'You can only advance workflows for projects in your organization',
        };
      }
    } else if (user.organizationId && !project.organizationId) {
      return {
        canAdvance: false,
        reason: 'You can only advance workflows for projects in your organization',
      };
    } else if (!user.organizationId && project.organizationId) {
      return {
        canAdvance: false,
        reason: 'You can only advance workflows for projects in your organization',
      };
    }

    const expectedRole = stages.find((s) => s.name === currentStep.stepName)?.requiredRole;
    const effectiveRequiredRole = expectedRole || currentStep.requiredRole;
    
    if (effectiveRequiredRole) {
      if (user.role.name !== effectiveRequiredRole) {
        return {
          canAdvance: false,
          reason: `Only users with role "${effectiveRequiredRole}" can advance from this stage. Current user role: "${user.role.name}"`,
        };
      }
    }

    return { canAdvance: true };
  }

  static async advance(projectId: string, userId: string, comment?: string) {
    const canAdvanceResult = await this.canAdvance(projectId, userId);
    if (!canAdvanceResult.canAdvance) {
      throw new Error(canAdvanceResult.reason || 'Cannot advance workflow');
    }

    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      throw new Error('No current step found');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const nextStepOrder = currentStep.stepOrder + 1;
    const nextStage = stages.find((s) => s.order === nextStepOrder);

    await prisma.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: StepStatus.COMPLETED,
        completedAt: new Date(),
        completedBy: userId,
      },
    });

    try {
      const currentStageRole = currentStep.requiredRole;
      if (currentStageRole) {
        await prisma.task.updateMany({
          where: {
            projectId,
            assignedRole: currentStageRole,
            status: 'PENDING',
            title: { contains: currentStep.stepName },
          },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            completedById: userId,
          },
        });
      }
    } catch (error) {
      logger.error('Error completing tasks:', error);
    }

    const nextStep = await prisma.workflowStep.findFirst({
      where: {
        projectId,
        stepOrder: nextStepOrder,
      },
    });

    if (nextStep) {
      await prisma.workflowStep.update({
        where: { id: nextStep.id },
        data: {
          status: StepStatus.IN_PROGRESS,
        },
      });
    }

    const newStatus = nextStage?.name === 'Completed' ? 'COMPLETED' : 'IN_PROGRESS';
    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentStage: nextStage?.name || 'Unknown',
        status: newStatus as any,
        completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      },
    });

    try {
      await VersionService.createProjectVersion(projectId, userId);
    } catch (error) {
      logger.error('Error creating project version:', { projectId, error });
    }

    try {
      await EventService.createEvent('WORKFLOW_ADVANCED', {
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'ADVANCE',
        userId,
        data: {
          fromStage: currentStep.stepName,
          toStage: nextStage?.name,
          stepOrder: currentStep.stepOrder,
          comment,
        },
      });
    } catch (error) {
      logger.error('Error creating lifecycle event:', { projectId, error });
    }

    await prisma.auditLog.create({
      data: {
        projectId,
        userId,
        action: 'ADVANCE_WORKFLOW',
        entityType: 'WORKFLOW',
        entityId: currentStep.id,
        changes: JSON.stringify({
          from: currentStep.stepName,
          to: nextStage?.name,
          comment,
        }),
      },
    });

    // Add comment if provided
    if (comment) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.comment.create({
          data: {
            projectId,
            userId,
            userName: user.name,
            content: comment,
            isInternal: true,
          },
        });
      }
    }

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { createdBy: true },
      });

      if (project && nextStage) {
        await NotificationService.create({
          userId: project.createdById,
          type: 'STAGE_CHANGE',
          title: 'Workflow Stage Advanced',
          message: `Project ${project.projectNumber} has moved to stage: ${nextStage.name}`,
          relatedProjectId: projectId,
          relatedEntityType: 'WORKFLOW',
          relatedEntityId: nextStep?.id,
        });

        // If next stage requires a role, notify users with that role
        if (nextStage.requiredRole) {
          await NotificationService.createForRole(
            nextStage.requiredRole,
            {
              type: 'APPROVAL_REQUEST',
              title: 'Action Required',
              message: `Project ${project.projectNumber} requires your attention at stage: ${nextStage.name}`,
              relatedProjectId: projectId,
              relatedEntityType: 'WORKFLOW',
              relatedEntityId: nextStep?.id,
            }
          );

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);

          await TaskService.create({
            projectId,
            type: 'APPROVAL',
            title: `Complete: ${nextStage.name}`,
            description: nextStage.description,
            assignedRole: nextStage.requiredRole,
            priority: 'HIGH',
            dueDate,
          });
        }
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }

    return await this.getWorkflowStatus(projectId);
  }

  static async canMoveBack(projectId: string, userId: string): Promise<{ canMoveBack: boolean; reason?: string }> {
    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      return { canMoveBack: false, reason: 'No active workflow step found' };
    }

    if (currentStep.stepOrder === 1) {
      return { canMoveBack: false, reason: 'Cannot move back from first stage' };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
      },
    });

    if (!project) {
      return { canMoveBack: false, reason: 'Project not found' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return { canMoveBack: false, reason: 'User not found' };
    }

    if (user.role.isAdmin) {
      return { canMoveBack: true };
    }

    if (user.organizationId && project.organizationId) {
      if (project.organizationId !== user.organizationId) {
        return {
          canMoveBack: false,
          reason: 'You can only move back workflows for projects in your organization',
        };
      }
    } else if (user.organizationId && !project.organizationId) {
      return {
        canMoveBack: false,
        reason: 'You can only move back workflows for projects in your organization',
      };
    } else if (!user.organizationId && project.organizationId) {
      return {
        canMoveBack: false,
        reason: 'You can only move back workflows for projects in your organization',
      };
    }

    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const expectedRole = stages.find((s) => s.name === currentStep.stepName)?.requiredRole;
    const effectiveRequiredRole = expectedRole || currentStep.requiredRole;
    
    if (effectiveRequiredRole && user.role.name !== effectiveRequiredRole) {
      return {
        canMoveBack: false,
        reason: `Only users with role "${effectiveRequiredRole}" can move back from this stage. Current user role: "${user.role.name}"`,
      };
    }

    return { canMoveBack: true };
  }

  static async moveBack(projectId: string, userId: string, comment?: string) {
    const canMoveBackResult = await this.canMoveBack(projectId, userId);
    if (!canMoveBackResult.canMoveBack) {
      throw new Error(canMoveBackResult.reason || 'Cannot move back workflow');
    }

    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      throw new Error('No current step found');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const previousStepOrder = currentStep.stepOrder - 1;

    await prisma.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: StepStatus.PENDING,
        completedAt: null,
        completedBy: null,
      },
    });

    const previousStep = await prisma.workflowStep.findFirst({
      where: {
        projectId,
        stepOrder: previousStepOrder,
      },
    });

    if (previousStep) {
      await prisma.workflowStep.update({
        where: { id: previousStep.id },
        data: {
          status: StepStatus.IN_PROGRESS,
        },
      });
    }

    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const previousStage = stages.find((s) => s.order === previousStepOrder);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentStage: previousStage?.name || 'Unknown',
        status: 'IN_PROGRESS',
      },
    });

    try {
      await VersionService.createProjectVersion(projectId, userId);
    } catch (error) {
      logger.error('Error creating project version:', { projectId, error });
    }

    try {
      await EventService.createEvent('WORKFLOW_MOVED_BACK', {
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'MOVE_BACK',
        userId,
        data: {
          fromStage: currentStep.stepName,
          toStage: previousStage?.name,
          stepOrder: currentStep.stepOrder,
          comment,
        },
      });
    } catch (error) {
      logger.error('Error creating lifecycle event:', { projectId, error });
    }

    await prisma.auditLog.create({
      data: {
        projectId,
        userId,
        action: 'MOVE_BACK_WORKFLOW',
        entityType: 'WORKFLOW',
        entityId: currentStep.id,
        changes: JSON.stringify({
          from: currentStep.stepName,
          to: previousStage?.name,
          comment,
        }),
      },
    });

    // Add comment if provided
    if (comment) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.comment.create({
          data: {
            projectId,
            userId,
            userName: user.name,
            content: comment,
            isInternal: true,
          },
        });
      }
    }

    return await this.getWorkflowStatus(projectId);
  }

  static async getWorkflowStatus(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      project,
      currentStep: await this.getCurrentStep(projectId),
      stages: project.workflowSteps,
    };
  }
}

