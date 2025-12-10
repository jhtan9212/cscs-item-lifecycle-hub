import { useState } from 'react';
import type { FC } from 'react';
import type { Item } from '../../types/item';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FieldOwnershipLabel } from './FieldOwnershipLabel';
import { FIELD_OWNERSHIP } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

interface ItemFormProps {
  item?: Item;
  projectId: string;
  onSubmit: (data: Partial<Item>) => Promise<void>;
  onCancel: () => void;
}

export const ItemForm: FC<ItemFormProps> = ({ item, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const userRole = user?.role?.name || '';
  const isSupplier = userRole === 'Supplier';
  const isDCOperator = userRole === 'DC Operator';
  const isAdmin = user?.role?.isAdmin || false;
  const isCategoryManager = userRole === 'Category Manager';
  const isStrategicSupply = userRole === 'Strategic Supply Manager';
  const isPricingSpecialist = userRole === 'Pricing Specialist';
  const isLogistics = userRole === 'Logistics';
  
  const [formData, setFormData] = useState<Partial<Item>>({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    cmItemNumber: item?.cmItemNumber || '',
    cmDescription: item?.cmDescription || '',
    cmCategory: item?.cmCategory || '',
    ssSupplier: item?.ssSupplier || '',
    supplierPrice: item?.supplierPrice || undefined,
    kinexoPrice: item?.kinexoPrice || undefined,
    freightStrategy: item?.freightStrategy || '',
    freightBrackets: item?.freightBrackets || undefined,
    supplierItemNumber: item?.supplierItemNumber || '',
    supplierSpecs: item?.supplierSpecs || undefined,
    dcStatus: item?.dcStatus || '',
    dcNotes: item?.dcNotes || '',
    ownedByCategoryManager: item?.ownedByCategoryManager ?? true,
    ownedByStrategicSupply: item?.ownedByStrategicSupply ?? false,
    ownedByPricingSpecialist: item?.ownedByPricingSpecialist ?? false,
    ownedByLogistics: item?.ownedByLogistics ?? false,
    ownedBySupplier: item?.ownedBySupplier ?? false,
    ownedByDCOperator: item?.ownedByDCOperator ?? false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Role-based data submission
      if (isSupplier) {
        // For suppliers, only submit supplier-specific fields
        const supplierData: Partial<Item> = {
          supplierItemNumber: formData.supplierItemNumber,
          supplierPrice: formData.supplierPrice,
          supplierSpecs: formData.supplierSpecs,
        };
        await onSubmit(supplierData);
      } else if (isDCOperator) {
        // For DC Operators, only submit DC-specific fields
        const dcData: Partial<Item> = {
          dcStatus: formData.dcStatus,
          dcNotes: formData.dcNotes,
        };
        await onSubmit(dcData);
      } else if (isCategoryManager) {
        // For Category Manager, only submit basic info and CM fields
        const cmData: Partial<Item> = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          cmItemNumber: formData.cmItemNumber,
          cmDescription: formData.cmDescription,
          cmCategory: formData.cmCategory,
          ownedByCategoryManager: true,
        };
        await onSubmit(cmData);
      } else if (isStrategicSupply) {
        // For Strategic Supply Manager, submit basic info, CM fields (read-only), and SS fields
        const ssData: Partial<Item> = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          cmItemNumber: formData.cmItemNumber,
          cmDescription: formData.cmDescription,
          cmCategory: formData.cmCategory,
          ssSupplier: formData.ssSupplier,
          ownedByCategoryManager: item?.ownedByCategoryManager ?? true,
          ownedByStrategicSupply: true,
        };
        await onSubmit(ssData);
      } else if (isPricingSpecialist) {
        // For Pricing Specialist, submit basic info, CM fields (read-only), SS fields (read-only), and pricing fields
        const pricingData: Partial<Item> = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          cmItemNumber: formData.cmItemNumber,
          cmDescription: formData.cmDescription,
          cmCategory: formData.cmCategory,
          ssSupplier: formData.ssSupplier,
          supplierPrice: formData.supplierPrice,
          kinexoPrice: formData.kinexoPrice,
          ownedByCategoryManager: item?.ownedByCategoryManager ?? true,
          ownedByStrategicSupply: item?.ownedByStrategicSupply ?? false,
          ownedByPricingSpecialist: true,
        };
        await onSubmit(pricingData);
      } else if (isLogistics) {
        // For Logistics, submit basic info, CM fields (read-only), SS fields (read-only), pricing fields (read-only), and logistics fields
        const logisticsData: Partial<Item> = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          cmItemNumber: formData.cmItemNumber,
          cmDescription: formData.cmDescription,
          cmCategory: formData.cmCategory,
          ssSupplier: formData.ssSupplier,
          supplierPrice: formData.supplierPrice,
          kinexoPrice: formData.kinexoPrice,
          freightStrategy: formData.freightStrategy,
          freightBrackets: formData.freightBrackets,
          ownedByCategoryManager: item?.ownedByCategoryManager ?? true,
          ownedByStrategicSupply: item?.ownedByStrategicSupply ?? false,
          ownedByPricingSpecialist: item?.ownedByPricingSpecialist ?? false,
          ownedByLogistics: true,
        };
        await onSubmit(logisticsData);
      } else if (isAdmin) {
        // Admin can submit all fields
        await onSubmit(formData);
      } else {
        // Default: submit all form data (fallback)
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information - Show for Category Manager, Strategic Supply, Pricing Specialist, Logistics, and Admin */}
      {(isCategoryManager || isStrategicSupply || isPricingSpecialist || isLogistics || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <Input
              label="Item Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Category Manager Fields - Show for Category Manager, Strategic Supply, Pricing Specialist, Logistics, and Admin */}
      {(isCategoryManager || isStrategicSupply || isPricingSpecialist || isLogistics || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <FieldOwnershipLabel owner={FIELD_OWNERSHIP.CATEGORY_MANAGER.owner} />
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Manager Fields</h3>
          <div className="space-y-4">
            <Input
              label="CM Item Number"
              value={formData.cmItemNumber}
              onChange={(e) => setFormData({ ...formData, cmItemNumber: e.target.value })}
              disabled={Boolean(!isCategoryManager && !isAdmin && item?.id)} // Read-only for other roles when editing
            />
            <Input
              label="CM Description"
              value={formData.cmDescription}
              onChange={(e) => setFormData({ ...formData, cmDescription: e.target.value })}
              disabled={Boolean(!isCategoryManager && !isAdmin && item?.id)} // Read-only for other roles when editing
            />
            <Input
              label="CM Category"
              value={formData.cmCategory}
              onChange={(e) => setFormData({ ...formData, cmCategory: e.target.value })}
              disabled={Boolean(!isCategoryManager && !isAdmin && item?.id)} // Read-only for other roles when editing
            />
          </div>
        </div>
      )}

      {/* Strategic Supply Fields - Show for Strategic Supply Manager, Pricing Specialist, Logistics, and Admin */}
      {(isStrategicSupply || isPricingSpecialist || isLogistics || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <FieldOwnershipLabel owner={FIELD_OWNERSHIP.STRATEGIC_SUPPLY.owner} />
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Supply Fields</h3>
          <div className="space-y-4">
            <Input
              label="Supplier"
              value={formData.ssSupplier}
              onChange={(e) => setFormData({ ...formData, ssSupplier: e.target.value })}
              disabled={!isStrategicSupply && !isAdmin && !!item?.id} // Read-only for other roles when editing
            />
          </div>
        </div>
      )}

      {/* Pricing Specialist Fields - Show for Pricing Specialist, Logistics, and Admin */}
      {(isPricingSpecialist || isLogistics || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <FieldOwnershipLabel owner={FIELD_OWNERSHIP.PRICING_SPECIALIST.owner} />
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Fields</h3>
          <div className="space-y-4">
            <Input
              label="Supplier Price"
              type="number"
              step="0.01"
              value={formData.supplierPrice || ''}
              onChange={(e) =>
                setFormData({ ...formData, supplierPrice: parseFloat(e.target.value) || undefined })
              }
              disabled={!isPricingSpecialist && !isAdmin && !!item?.id} // Read-only for Logistics when editing
            />
            <Input
              label="KINEXO Price"
              type="number"
              step="0.01"
              value={formData.kinexoPrice || ''}
              onChange={(e) =>
                setFormData({ ...formData, kinexoPrice: parseFloat(e.target.value) || undefined })
              }
              disabled={!isPricingSpecialist && !isAdmin && !!item?.id} // Read-only for Logistics when editing
            />
          </div>
        </div>
      )}

      {/* Logistics Fields - Show for Logistics and Admin */}
      {(isLogistics || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <FieldOwnershipLabel owner={FIELD_OWNERSHIP.LOGISTICS.owner} />
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Fields</h3>
          <div className="space-y-4">
            <Input
              label="Freight Strategy"
              value={formData.freightStrategy || ''}
              onChange={(e) => setFormData({ ...formData, freightStrategy: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Freight Brackets (JSON)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={
                  typeof formData.freightBrackets === 'string'
                    ? formData.freightBrackets
                    : formData.freightBrackets
                      ? JSON.stringify(formData.freightBrackets, null, 2)
                      : ''
                }
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                    setFormData({ ...formData, freightBrackets: parsed });
                  } catch {
                    setFormData({ ...formData, freightBrackets: e.target.value as any });
                  }
                }}
                placeholder='{"zone1": 10.00, "zone2": 15.00, "zone3": 20.00}'
              />
              <p className="text-xs text-gray-500 mt-1">Enter valid JSON format</p>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Fields - Show for Supplier and Admin */}
      {(isSupplier || isAdmin) && (
        <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.SUPPLIER.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Fields</h3>
        <div className="space-y-4">
          <Input
            label="Supplier Item Number"
            value={formData.supplierItemNumber || ''}
            onChange={(e) => setFormData({ ...formData, supplierItemNumber: e.target.value })}
          />
          <Input
            label="Supplier Price"
            type="number"
            step="0.01"
            value={formData.supplierPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, supplierPrice: parseFloat(e.target.value) || undefined })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier Specifications (JSON)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={
                typeof formData.supplierSpecs === 'string'
                  ? formData.supplierSpecs
                  : formData.supplierSpecs
                    ? JSON.stringify(formData.supplierSpecs, null, 2)
                    : ''
              }
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                  setFormData({ ...formData, supplierSpecs: parsed });
                } catch {
                  setFormData({ ...formData, supplierSpecs: e.target.value as any });
                }
              }}
              placeholder='{"material": "Steel", "dimensions": "10x5x2", "weight": "5 lbs"}'
            />
            <p className="text-xs text-gray-500 mt-1">Enter valid JSON format</p>
          </div>
        </div>
      </div>
      )}

      {/* DC Operator Fields - Only show to DC Operator */}
      {isDCOperator && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <FieldOwnershipLabel owner={FIELD_OWNERSHIP.DC_OPERATOR.owner} />
          <h3 className="text-lg font-semibold text-gray-900 mb-4">DC Operator Fields</h3>
          <div className="space-y-4">
            <Input
              label="DC Status"
              value={formData.dcStatus || ''}
              onChange={(e) => setFormData({ ...formData, dcStatus: e.target.value })}
              placeholder="e.g., In Stock, Transitioning, Runout"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DC Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={formData.dcNotes || ''}
                onChange={(e) => setFormData({ ...formData, dcNotes: e.target.value })}
                placeholder="DC setup notes, inventory status, etc."
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};
