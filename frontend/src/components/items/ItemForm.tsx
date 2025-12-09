import React, { useState, useEffect } from 'react';
import { Item } from '../../types/item';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FieldOwnershipLabel } from './FieldOwnershipLabel';
import { FIELD_OWNERSHIP } from '../../utils/constants';

interface ItemFormProps {
  item?: Item;
  projectId: string;
  onSubmit: (data: Partial<Item>) => Promise<void>;
  onCancel: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, projectId, onSubmit, onCancel }) => {
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
    supplierItemNumber: item?.supplierItemNumber || '',
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
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

      {/* Category Manager Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.CATEGORY_MANAGER.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Manager Fields</h3>
        <div className="space-y-4">
          <Input
            label="CM Item Number"
            value={formData.cmItemNumber}
            onChange={(e) => setFormData({ ...formData, cmItemNumber: e.target.value })}
          />
          <Input
            label="CM Description"
            value={formData.cmDescription}
            onChange={(e) => setFormData({ ...formData, cmDescription: e.target.value })}
          />
          <Input
            label="CM Category"
            value={formData.cmCategory}
            onChange={(e) => setFormData({ ...formData, cmCategory: e.target.value })}
          />
        </div>
      </div>

      {/* Strategic Supply Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.STRATEGIC_SUPPLY.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Supply Fields</h3>
        <div className="space-y-4">
          <Input
            label="Supplier"
            value={formData.ssSupplier}
            onChange={(e) => setFormData({ ...formData, ssSupplier: e.target.value })}
          />
        </div>
      </div>

      {/* Pricing Specialist Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.PRICING_SPECIALIST.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Fields</h3>
        <div className="space-y-4">
          <Input
            label="Supplier Price"
            type="number"
            step="0.01"
            value={formData.supplierPrice || ''}
            onChange={(e) => setFormData({ ...formData, supplierPrice: parseFloat(e.target.value) || undefined })}
          />
          <Input
            label="KINEXO Price"
            type="number"
            step="0.01"
            value={formData.kinexoPrice || ''}
            onChange={(e) => setFormData({ ...formData, kinexoPrice: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </div>

      {/* Logistics Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.LOGISTICS.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Fields</h3>
        <div className="space-y-4">
          <Input
            label="Freight Strategy"
            value={formData.freightStrategy}
            onChange={(e) => setFormData({ ...formData, freightStrategy: e.target.value })}
          />
        </div>
      </div>

      {/* Supplier Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FieldOwnershipLabel owner={FIELD_OWNERSHIP.SUPPLIER.owner} />
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Fields</h3>
        <div className="space-y-4">
          <Input
            label="Supplier Item Number"
            value={formData.supplierItemNumber}
            onChange={(e) => setFormData({ ...formData, supplierItemNumber: e.target.value })}
          />
        </div>
      </div>

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

