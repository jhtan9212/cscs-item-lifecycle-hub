import React from 'react';
import { WorkflowStep, StepStatus } from '../../types/project';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStage: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ steps, currentStage }) => {
  const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'pending' => {
    if (step.status === 'COMPLETED') return 'completed';
    if (step.stepName === currentStage || step.status === 'IN_PROGRESS') return 'current';
    return 'pending';
  };

  const getStepIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'current':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Workflow Status</h3>
      <div className="space-y-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center">
                {getStepIcon(status)}
                {!isLast && (
                  <div
                    className={`w-0.5 h-12 mt-2 ${
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className="ml-4 flex-1 pb-6">
                <div className="flex items-center">
                  <h4
                    className={`text-base font-medium ${
                      status === 'completed'
                        ? 'text-green-600'
                        : status === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.stepName}
                  </h4>
                  {status === 'current' && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">Current Step</span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                )}
                {step.completedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Completed: {new Date(step.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

