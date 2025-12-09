import React from 'react';
import { FIELD_OWNERSHIP } from '../../utils/constants';

interface FieldOwnershipLabelProps {
  owner: string;
  community?: string;
}

export const FieldOwnershipLabel: React.FC<FieldOwnershipLabelProps> = ({ owner, community }) => {
  const ownershipInfo = Object.values(FIELD_OWNERSHIP).find(
    (info) => info.owner === owner
  );

  const color = ownershipInfo?.color || '#6b7280';
  const displayCommunity = community || ownershipInfo?.community || 'Unknown';

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-600">
        <span className="font-medium">{owner}</span>
        {displayCommunity && ` • ${displayCommunity}`}
      </span>
    </div>
  );
};

