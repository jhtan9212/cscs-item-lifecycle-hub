import type { FC } from 'react';
import type { WorkflowStep } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStage: string;
  lifecycleType?: 'NEW_ITEM' | 'TRANSITIONING_ITEM' | 'DELETING_ITEM';
}

// Stage-specific color mapping for better visual distinction
const getStageColor = (stageName: string, status: 'completed' | 'current' | 'pending'): string => {
  if (status === 'completed') {
    return 'bg-green-500 dark:bg-green-600 text-white';
  }
  if (status === 'current') {
    // Color-code current stage based on stage type
    if (!stageName) {
      return 'bg-primary text-white';
    }
    if (stageName.includes('Draft') || stageName.includes('Item Comparison')) {
      return 'bg-blue-500 dark:bg-blue-600 text-white';
    }
    if (stageName.includes('Pricing') || stageName.includes('KINEXO')) {
      return 'bg-purple-500 dark:bg-purple-600 text-white';
    }
    if (stageName.includes('Approval') || stageName.includes('Review')) {
      return 'bg-orange-500 dark:bg-orange-600 text-white';
    }
    if (stageName.includes('Freight') || stageName.includes('Logistics')) {
      return 'bg-cyan-500 dark:bg-cyan-600 text-white';
    }
    if (stageName.includes('Transition') || stageName.includes('DC') || stageName.includes('Runout')) {
      return 'bg-indigo-500 dark:bg-indigo-600 text-white';
    }
    if (stageName.includes('Completed')) {
      return 'bg-green-500 dark:bg-green-600 text-white';
    }
    return 'bg-primary text-white';
  }
  return 'bg-muted border-2 border-muted-foreground/20 text-muted-foreground';
};

export const WorkflowTimeline: FC<WorkflowTimelineProps> = ({ steps, currentStage }) => {
  const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'pending' | 'rejected' => {
    if (step.status === 'COMPLETED') return 'completed';
    if (step.status === 'REJECTED') return 'rejected';
    if (step.stepName === currentStage || step.status === 'IN_PROGRESS') return 'current';
    return 'pending';
  };

  const getStepIcon = (status: 'completed' | 'current' | 'pending' | 'rejected', stageName: string) => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center ring-2';
    
    switch (status) {
      case 'completed':
        return (
          <div className={cn(baseClasses, 'bg-green-500 dark:bg-green-600 ring-green-200 dark:ring-green-900')}>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        );
      case 'rejected':
        return (
          <div className={cn(baseClasses, 'bg-red-500 dark:bg-red-600 ring-red-200 dark:ring-red-900')}>
            <XCircle className="w-5 h-5 text-white" />
          </div>
        );
      case 'current':
        const colorClass = getStageColor(stageName, 'current');
        return (
          <div className={cn(baseClasses, colorClass, 'ring-opacity-20 animate-pulse')}>
            <Circle className="w-4 h-4 fill-white text-white" />
          </div>
        );
      default:
        return (
          <div className={cn(baseClasses, 'bg-muted border-2 border-muted-foreground/20')}>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
        );
    }
  };

  const getConnectorColor = (status: 'completed' | 'current' | 'pending' | 'rejected') => {
    if (status === 'completed') return 'bg-green-500 dark:bg-green-600';
    if (status === 'rejected') return 'bg-red-500 dark:bg-red-600';
    if (status === 'current') return 'bg-primary';
    return 'bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Workflow Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  {getStepIcon(status, step.stepName || '')}
                  {!isLast && <div className={cn('w-0.5 h-12 mt-2', getConnectorColor(status))} />}
                </div>
                <div className="ml-4 flex-1 pb-6">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        'text-base font-medium',
                        status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : status === 'rejected'
                            ? 'text-red-600 dark:text-red-400'
                            : status === 'current'
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground'
                      )}
                    >
                      {step.stepName}
                    </h4>
                    {status === 'current' && (
                      <Badge variant="default" className="text-xs animate-pulse">
                        Current Step
                      </Badge>
                    )}
                    {status === 'rejected' && (
                      <Badge variant="destructive" className="text-xs">
                        Rejected
                      </Badge>
                    )}
                    {step.requiredRole && (
                      <Badge variant="outline" className="text-xs">
                        {step.requiredRole}
                      </Badge>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  )}
                  {step.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed: {new Date(step.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
