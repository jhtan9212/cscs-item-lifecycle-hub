import type { FC } from 'react';
import type { WorkflowStep } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStage: string;
}

export const WorkflowTimeline: FC<WorkflowTimelineProps> = ({ steps, currentStage }) => {
  const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'pending' => {
    if (step.status === 'COMPLETED') return 'completed';
    if (step.stepName === currentStage || step.status === 'IN_PROGRESS') return 'current';
    return 'pending';
  };

  const getStepIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center ring-2 ring-green-200 dark:ring-green-900">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        );
      case 'current':
        return (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
            <Circle className="w-4 h-4 fill-white text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-muted-foreground/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
        );
    }
  };

  const getConnectorColor = (status: 'completed' | 'current' | 'pending') => {
    if (status === 'completed') return 'bg-green-500 dark:bg-green-600';
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
                  {getStepIcon(status)}
                  {!isLast && <div className={cn('w-0.5 h-12 mt-2', getConnectorColor(status))} />}
                </div>
                <div className="ml-4 flex-1 pb-6">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        'text-base font-medium',
                        status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : status === 'current'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                      )}
                    >
                      {step.stepName}
                    </h4>
                    {status === 'current' && (
                      <Badge variant="default" className="text-xs">
                        Current Step
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
