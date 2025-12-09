import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';
import type { Item } from '../types/item';
import { projectService } from '../services/projectService';
import { itemService } from '../services/itemService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { usePermissions } from '../hooks/usePermissions';

export const LogisticsWorkflow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [freightData, setFreightData] = useState<Record<string, { freightStrategy?: string; freightBrackets?: string }>>({});

  useEffect(() => {
    if (id) {
      loadProject();
      loadItems();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id!);
      setProject(data);
      
      if (data.currentStage !== 'Freight Strategy') {
        setError('This project is not at the Freight Strategy stage');
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      if (id) {
        const data = await itemService.getByProject(id);
        setItems(data);
        
        // Initialize freight data
        const initialFreight: Record<string, { freightStrategy?: string; freightBrackets?: string }> = {};
        data.forEach((item) => {
          initialFreight[item.id] = {
            freightStrategy: item.freightStrategy,
            freightBrackets: typeof item.freightBrackets === 'string' ? item.freightBrackets : JSON.stringify(item.freightBrackets || {}),
          };
        });
        setFreightData(initialFreight);
      }
    } catch (err: any) {
      console.error('Failed to load items:', err);
    }
  };

  const handleFreightChange = (itemId: string, field: 'freightStrategy' | 'freightBrackets', value: string) => {
    setFreightData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSaveFreight = async (itemId: string) => {
    try {
      const freight = freightData[itemId];
      await itemService.update(itemId, {
        freightStrategy: freight?.freightStrategy,
        freightBrackets: freight?.freightBrackets ? JSON.parse(freight.freightBrackets) : undefined,
      });
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Failed to save freight strategy');
    }
  };

  const handleSubmitFreightStrategy = async () => {
    if (!id) return;
    
    // Validate all items have freight strategy
    const missingStrategy = items.filter((item) => {
      const freight = freightData[item.id];
      return !freight?.freightStrategy;
    });

    if (missingStrategy.length > 0) {
      alert(`Please set Freight Strategy for all items before submitting. Missing: ${missingStrategy.length} item(s)`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Save all freight updates
      for (const item of items) {
        const freight = freightData[item.id];
        if (freight) {
          await itemService.update(item.id, {
            freightStrategy: freight.freightStrategy,
            freightBrackets: freight.freightBrackets ? JSON.parse(freight.freightBrackets) : undefined,
          });
        }
      }

      // Advance workflow
      await projectService.advanceWorkflow(id, 'Freight strategy submitted');
      
      alert('Freight strategy submitted successfully!');
      navigate('/my-tasks');
    } catch (err: any) {
      alert(err.message || 'Failed to submit freight strategy');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Project not found'}</p>
        <Button onClick={() => navigate('/my-tasks')} className="mt-4" variant="outline">
          Back to My Tasks
        </Button>
      </div>
    );
  }

  if (project.currentStage !== 'Freight Strategy') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          This project is at "{project.currentStage}" stage, not "Freight Strategy" stage.
        </p>
        <Button onClick={() => navigate(`/projects/${project.id}`)} className="mt-4" variant="outline">
          View Project
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => navigate('/my-tasks')} variant="outline" size="sm" className="mb-4">
          ← Back to My Tasks
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Freight Strategy</h1>
        <p className="text-gray-500 mt-1">
          Project: {project.name} ({project.projectNumber})
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <strong>Instructions:</strong> Set freight strategy and brackets for each item. 
          All items must have a freight strategy before you can submit.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No items found in this project</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const freight = freightData[item.id] || {};
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Input
                      label="Freight Strategy *"
                      value={freight.freightStrategy || ''}
                      onChange={(e) =>
                        handleFreightChange(item.id, 'freightStrategy', e.target.value)
                      }
                      placeholder="e.g., Standard Ground, Express, Air Freight"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Required: Define shipping method</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Freight Brackets (JSON)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      value={freight.freightBrackets || ''}
                      onChange={(e) =>
                        handleFreightChange(item.id, 'freightBrackets', e.target.value)
                      }
                      placeholder='{"zone1": 10.00, "zone2": 15.00, ...}'
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: JSON format for freight brackets by zone</p>
                  </div>
                </div>

                {hasPermission('UPDATE_ITEM') && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handleSaveFreight(item.id)}
                      size="sm"
                      variant="outline"
                    >
                      Save Freight Strategy
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Submit?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Make sure all items have freight strategy set before submitting.
                </p>
              </div>
              {hasPermission('UPDATE_ITEM') && (
                <Button
                  onClick={handleSubmitFreightStrategy}
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Submit Freight Strategy
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

