export interface Item {
  id: string;
  projectId: string;
  itemNumber?: string;
  name: string;
  description?: string;
  category?: string;

  // Field ownership
  ownedByCategoryManager: boolean;
  ownedByStrategicSupply: boolean;
  ownedByPricingSpecialist: boolean;
  ownedByLogistics: boolean;
  ownedBySupplier: boolean;
  ownedByDCOperator: boolean;

  // Category Manager fields
  cmItemNumber?: string;
  cmDescription?: string;
  cmCategory?: string;

  // Strategic Supply fields
  ssSupplier?: string;
  ssDistributionCenters?: string[];

  // Pricing Specialist fields
  supplierPrice?: number;
  kinexoPrice?: number;
  pricingStatus?: string;

  // Logistics fields
  freightStrategy?: string;
  freightBrackets?: string;

  // Supplier fields
  supplierItemNumber?: string;
  supplierSpecs?: string;

  // DC Operator fields
  dcStatus?: string;
  dcNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FieldOwnership {
  owner: string;
  community: string;
}
