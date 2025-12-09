import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface WorkflowControlsProps {
  projectId: string;
  currentStage: string;
  canAdvance: boolean;
  canMoveBack: boolean;
  onAdvance: (comment?: string) => Promise<void>;
  onMoveBack: (comment?: string) => Promise<void>;
}

export const WorkflowControls: FC<WorkflowControlsProps> = ({
  currentStage,
  canAdvance,
  canMoveBack,
  onAdvance,
  onMoveBack,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdvance = async () => {
    try {
      setLoading(true);
      await onAdvance(comment || undefined);
      setComment('');
    } catch (error) {
      console.error('Failed to advance workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveBack = async () => {
    try {
      setLoading(true);
      await onMoveBack(comment || undefined);
      setComment('');
    } catch (error) {
      console.error('Failed to move back workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Controls</h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Current Stage: <span className="font-medium">{currentStage}</span>
        </p>
        <Input
          label="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment about this workflow change..."
        />
      </div>
      <div className="flex space-x-4">
        <Button
          onClick={handleAdvance}
          disabled={!canAdvance || loading}
          isLoading={loading}
          variant="primary"
        >
          Advance to Next Stage
        </Button>
        <Button
          onClick={handleMoveBack}
          disabled={!canMoveBack || loading}
          isLoading={loading}
          variant="outline"
        >
          Move Back
        </Button>
      </div>
    </div>
  );
};

