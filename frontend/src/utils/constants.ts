export const LIFECYCLE_TYPES = {
  NEW_ITEM: 'New Item',
  TRANSITIONING_ITEM: 'Transitioning Item',
  DELETING_ITEM: 'Deleting Item',
} as const;

export const PROJECT_STATUS = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  WAITING_ON_SUPPLIER: 'Waiting on Supplier',
  WAITING_ON_DISTRIBUTOR: 'Waiting on Distributor',
  INTERNAL_REVIEW: 'Internal Review',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
} as const;

export const FIELD_OWNERSHIP = {
  CATEGORY_MANAGER: {
    owner: 'Category Manager',
    community: 'Internal CSCS',
    color: '#3b82f6',
  },
  STRATEGIC_SUPPLY: {
    owner: 'Strategic Supply Manager',
    community: 'Internal CSCS',
    color: '#10b981',
  },
  PRICING_SPECIALIST: {
    owner: 'Pricing Specialist',
    community: 'Internal CSCS',
    color: '#f59e0b',
  },
  LOGISTICS: {
    owner: 'Logistics',
    community: 'Internal CSCS',
    color: '#8b5cf6',
  },
  SUPPLIER: {
    owner: 'Supplier',
    community: 'External',
    color: '#ef4444',
  },
  DC_OPERATOR: {
    owner: 'DC Operator',
    community: 'External',
    color: '#ec4899',
  },
} as const;
