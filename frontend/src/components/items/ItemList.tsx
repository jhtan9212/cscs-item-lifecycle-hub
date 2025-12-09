import React from 'react';
import { Item } from '../../types/item';
import { Button } from '../common/Button';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onCreateNew: () => void;
}

export const ItemList: React.FC<ItemListProps> = ({ items, onEdit, onDelete, onCreateNew }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Items</h3>
        <Button onClick={onCreateNew} size="sm">
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No items found</p>
          <Button onClick={onCreateNew} size="sm">
            Create First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  {item.category && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => onEdit(item)} size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(item.id)}
                    size="sm"
                    variant="danger"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

