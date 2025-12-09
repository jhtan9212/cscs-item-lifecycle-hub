import type { Item } from './item';

export type LifecycleType = 'NEW_ITEM' | 'TRANSITIONING_ITEM' | 'DELETING_ITEM';
export type ProjectStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'WAITING_ON_SUPPLIER'
  | 'WAITING_ON_DISTRIBUTOR'
  | 'INTERNAL_REVIEW'
  | 'COMPLETED'
  | 'REJECTED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'SKIPPED';

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  description?: string;
  lifecycleType: LifecycleType;
  status: ProjectStatus;
  currentStage: string;
  createdById: string;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    domain?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
  };
  items?: Item[];
  workflowSteps?: WorkflowStep[];
  comments?: Comment[];
}

export interface WorkflowStep {
  id: string;
  projectId: string;
  stepName: string;
  stepOrder: number;
  status: StepStatus;
  completedAt?: string;
  completedBy?: string;
  requiredRole?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}
