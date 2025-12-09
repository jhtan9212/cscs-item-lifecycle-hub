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
import { useToast } from '@/components/ui/use-toast';

export const PricingWorkflow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pricingData, setPricingData] = useState<
    Record<string, { supplierPrice?: number; kinexoPrice?: number }>
  >({});

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

      // Verify this is KINEXO Pricing stage
      if (data.currentStage !== 'KINEXO Pricing') {
        setError('This project is not at the KINEXO Pricing stage');
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

        // Initialize pricing data
        const initialPricing: Record<string, { supplierPrice?: number; kinexoPrice?: number }> = {};
        data.forEach((item) => {
          initialPricing[item.id] = {
            supplierPrice: item.supplierPrice,
            kinexoPrice: item.kinexoPrice,
          };
        });
        setPricingData(initialPricing);
      }
    } catch (err: any) {
      console.error('Failed to load items:', err);
    }
  };

  const handlePricingChange = (
    itemId: string,
    field: 'supplierPrice' | 'kinexoPrice',
    value: number
  ) => {
    setPricingData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSavePricing = async (itemId: string) => {
    try {
      const pricing = pricingData[itemId];
      await itemService.update(itemId, {
        supplierPrice: pricing?.supplierPrice,
        kinexoPrice: pricing?.kinexoPrice,
      });
      await loadItems();
      toast({
        title: 'Pricing Saved',
        description: 'Pricing has been successfully saved.',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save pricing';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitPricing = async () => {
    if (!id) return;

    // Validate all items have pricing
    const missingPricing = items.filter((item) => {
      const pricing = pricingData[item.id];
      return !pricing?.kinexoPrice;
    });

    if (missingPricing.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please set KINEXO Price for all items before submitting. Missing: ${missingPricing.length} item(s)`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Save all pricing updates
      for (const item of items) {
        const pricing = pricingData[item.id];
        if (pricing) {
          await itemService.update(item.id, {
            supplierPrice: pricing.supplierPrice,
            kinexoPrice: pricing.kinexoPrice,
          });
        }
      }

      // Advance workflow
      await projectService.advanceWorkflow(id, 'Pricing submitted and approved');

      toast({
        title: 'Success',
        description: 'Pricing has been submitted successfully!',
      });
      navigate('/my-tasks');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit pricing';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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

  if (project.currentStage !== 'KINEXO Pricing') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          This project is at "{project.currentStage}" stage, not "KINEXO Pricing" stage.
        </p>
        <Button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="mt-4"
          variant="outline"
        >
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
        <h1 className="text-3xl font-bold text-gray-900">KINEXO Pricing Review</h1>
        <p className="text-gray-500 mt-1">
          Project: {project.name} ({project.projectNumber})
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <strong>Instructions:</strong> Review supplier pricing and set KINEXO pricing for each
          item. All items must have KINEXO pricing before you can submit for approval.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No items found in this project</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const pricing = pricingData[item.id] || {};
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Supplier Price"
                      type="number"
                      step="0.01"
                      value={pricing.supplierPrice || item.supplierPrice || ''}
                      onChange={(e) =>
                        handlePricingChange(
                          item.id,
                          'supplierPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Read-only (from supplier)</p>
                  </div>

                  <div>
                    <Input
                      label="KINEXO Price *"
                      type="number"
                      step="0.01"
                      value={pricing.kinexoPrice || ''}
                      onChange={(e) =>
                        handlePricingChange(item.id, 'kinexoPrice', parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Required: Set internal pricing</p>
                  </div>
                </div>

                {hasPermission('UPDATE_ITEM') && (
                  <div className="mt-4">
                    <Button onClick={() => handleSavePricing(item.id)} size="sm" variant="outline">
                      Save Pricing
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
                  Make sure all items have KINEXO pricing set before submitting.
                </p>
              </div>
              {hasPermission('SUBMIT_PRICING') && (
                <Button onClick={handleSubmitPricing} isLoading={submitting} disabled={submitting}>
                  Submit Pricing for Approval
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
