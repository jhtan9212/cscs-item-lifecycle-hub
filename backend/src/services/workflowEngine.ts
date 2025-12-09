import prisma from '../config/database';
import { Project, LifecycleType, StepStatus } from '@prisma/client';

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
      },
    });

    if (!project) {
      return { canAdvance: false, reason: 'Project not found' };
    }

    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      return { canAdvance: false, reason: 'No active workflow step found' };
    }

    // Check if current step is completed
    if (currentStep.status !== StepStatus.COMPLETED && currentStep.status !== StepStatus.IN_PROGRESS) {
      return { canAdvance: false, reason: 'Current step must be in progress or completed' };
    }

    // Check if it's the final stage
    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const isFinalStage = currentStep.stepOrder >= stages.length;
    if (isFinalStage) {
      return { canAdvance: false, reason: 'Already at final stage' };
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

    // Mark current step as completed
    await prisma.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: StepStatus.COMPLETED,
        completedAt: new Date(),
        completedBy: userId,
      },
    });

    // Activate next step
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

    // Update project current stage and status
    const newStatus = nextStage?.name === 'Completed' ? 'COMPLETED' : 'IN_PROGRESS';
    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentStage: nextStage?.name || 'Unknown',
        status: newStatus as any,
        completedAt: newStatus === 'COMPLETED' ? new Date() : null,
      },
    });

    // Create audit log
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

    return await this.getWorkflowStatus(projectId);
  }

  static async moveBack(projectId: string, userId: string, comment?: string) {
    const currentStep = await this.getCurrentStep(projectId);
    if (!currentStep) {
      throw new Error('No current step found');
    }

    if (currentStep.stepOrder === 1) {
      throw new Error('Cannot move back from first stage');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const previousStepOrder = currentStep.stepOrder - 1;

    // Mark current step as pending
    await prisma.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: StepStatus.PENDING,
        completedAt: null,
        completedBy: null,
      },
    });

    // Activate previous step
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

    // Update project current stage
    const stages = this.getStagesForLifecycle(project.lifecycleType);
    const previousStage = stages.find((s) => s.order === previousStepOrder);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentStage: previousStage?.name || 'Unknown',
        status: 'IN_PROGRESS',
      },
    });

    // Create audit log
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

