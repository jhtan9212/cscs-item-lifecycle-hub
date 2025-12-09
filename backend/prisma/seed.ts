import { PrismaClient, StepStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { WorkflowEngine } from '../src/services/workflowEngine';
import { generateProjectNumber } from '../src/utils/helpers';

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

async function main() {
  console.log('Seeding database...');

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrator with all permissions',
      isAdmin: true,
    },
  });

  const categoryManagerRole = await prisma.role.upsert({
    where: { name: 'Category Manager' },
    update: {},
    create: {
      name: 'Category Manager',
      description: 'Manages categories and projects',
      isAdmin: false,
    },
  });

  const strategicSupplyRole = await prisma.role.upsert({
    where: { name: 'Strategic Supply Manager' },
    update: {},
    create: {
      name: 'Strategic Supply Manager',
      description: 'Manages strategic supply chain',
      isAdmin: false,
    },
  });

  const pricingSpecialistRole = await prisma.role.upsert({
    where: { name: 'Pricing Specialist' },
    update: {},
    create: {
      name: 'Pricing Specialist',
      description: 'Manages pricing',
      isAdmin: false,
    },
  });

  const logisticsRole = await prisma.role.upsert({
    where: { name: 'Logistics' },
    update: {},
    create: {
      name: 'Logistics',
      description: 'Manages logistics and freight',
      isAdmin: false,
    },
  });

  const supplierRole = await prisma.role.upsert({
    where: { name: 'Supplier' },
    update: {},
    create: {
      name: 'Supplier',
      description: 'External supplier partner',
      isAdmin: false,
    },
  });

  const dcOperatorRole = await prisma.role.upsert({
    where: { name: 'DC Operator' },
    update: {},
    create: {
      name: 'DC Operator',
      description: 'Distribution center operator',
      isAdmin: false,
    },
  });

  // Create Permissions - Based on screenshots and requirements
  const permissions = [
    // Projects
    { name: 'CREATE_PROJECT', category: 'Projects', description: 'Create new projects' },
    { name: 'UPDATE_PROJECT', category: 'Projects', description: 'Update projects' },
    { name: 'UPDATE_ALL_PROJECTS', category: 'Projects', description: 'Edit any project' },
    { name: 'UPDATE_OWN_PROJECTS', category: 'Projects', description: 'Edit own projects' },
    { name: 'DELETE_PROJECT', category: 'Projects', description: 'Delete projects' },
    { name: 'VIEW_PROJECT', category: 'Projects', description: 'View all projects in system' },
    { name: 'VIEW_ALL_PROJECTS', category: 'Projects', description: 'View all projects in system' },
    { name: 'VIEW_OWN_PROJECTS', category: 'Projects', description: 'View projects assigned to user' },
    
    // Items
    { name: 'CREATE_ITEM', category: 'Items', description: 'Create items' },
    { name: 'UPDATE_ITEM', category: 'Items', description: 'Update items' },
    { name: 'DELETE_ITEM', category: 'Items', description: 'Delete items' },
    { name: 'VIEW_ITEM', category: 'Items', description: 'View items' },
    
    // Workflow
    { name: 'ADVANCE_WORKFLOW', category: 'Workflow', description: 'Advance workflow stages' },
    { name: 'MOVE_BACK_WORKFLOW', category: 'Workflow', description: 'Move workflow back' },
    { name: 'APPROVE_AS_CM', category: 'Workflow', description: 'Approve as Category Manager' },
    { name: 'APPROVE_AS_SSM', category: 'Workflow', description: 'Approve as Strategic Supply Manager' },
    { name: 'COMPLETE_DC_SETUP', category: 'Workflow', description: 'Complete DC transition setup and advance project' },
    { name: 'REJECT_PROJECTS', category: 'Workflow', description: 'Reject project submissions' },
    { name: 'SUBMIT_FOR_REVIEW', category: 'Workflow', description: 'Submit projects for review' },
    { name: 'SUBMIT_FREIGHT_STRATEGY', category: 'Workflow', description: 'Submit freight strategy data' },
    { name: 'SUBMIT_KINEXO_PRICING', category: 'Workflow', description: 'Submit internal pricing' },
    { name: 'SUBMIT_SUPPLIER_PRICING', category: 'Workflow', description: 'Submit supplier pricing' },
    { name: 'VIEW_FREIGHT_STRATEGY', category: 'Workflow', description: 'Can view freight strategy data and brackets' },
    
    // Pricing
    { name: 'APPROVE_PRICING', category: 'Pricing', description: 'Approve pricing submissions' },
    { name: 'SUBMIT_PRICING', category: 'Pricing', description: 'Submit pricing data' },
    { name: 'VIEW_PRICING', category: 'Pricing', description: 'View pricing data' },
    
    // Users
    { name: 'CREATE_USERS', category: 'Users', description: 'Create new users' },
    { name: 'MANAGE_USERS', category: 'Users', description: 'Manage users' },
    { name: 'MANAGE_ROLES', category: 'Users', description: 'Assign/remove user roles' },
    { name: 'MANAGE_PERMISSIONS', category: 'Users', description: 'Configure role permissions' },
    { name: 'VIEW_USERS', category: 'Users', description: 'View user list' },
    
    // Audit
    { name: 'EXPORT_DATA', category: 'Audit', description: 'Export system data' },
    { name: 'VIEW_AUDIT_LOGS', category: 'Audit', description: 'View audit trail' },
    
    // Dashboard
    { name: 'VIEW_ANALYTICS', category: 'Dashboard', description: 'Access analytics and reports' },
    { name: 'VIEW_DASHBOARD', category: 'Dashboard', description: 'Access main dashboard' },
    
    // Distribution
    { name: 'MANAGE_DCS', category: 'Distribution', description: 'Create/edit distribution centers' },
    { name: 'VIEW_DCS', category: 'Distribution', description: 'View distribution centers' },
    
    // System
    { name: 'MANAGE_SETTINGS', category: 'System', description: 'Edit system settings' },
    { name: 'VIEW_SETTINGS', category: 'System', description: 'View system settings' },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: { granted: true },
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // Category Manager permissions - Based on screenshots
  const cmPermissions = [
    'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_DCS',
    'CREATE_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM', 'VIEW_ITEM',
    'CREATE_PROJECT', 'UPDATE_OWN_PROJECTS', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS',
    'APPROVE_AS_CM', 'REJECT_PROJECTS', 'SUBMIT_FOR_REVIEW', 'VIEW_FREIGHT_STRATEGY',
    'APPROVE_PRICING', 'VIEW_PRICING'
  ];
  for (const permName of cmPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: categoryManagerRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: categoryManagerRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // Strategic Supply Manager permissions - Based on screenshots
  const ssmPermissions = [
    'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_AUDIT_LOGS',
    'MANAGE_DCS', 'VIEW_DCS',
    'CREATE_ITEM', 'VIEW_ITEM',
    'VIEW_ALL_PROJECTS',
    'APPROVE_AS_SSM', 'REJECT_PROJECTS', 'VIEW_FREIGHT_STRATEGY',
    'VIEW_PRICING',
    'ADVANCE_WORKFLOW', // Required to advance workflow after approval
    'MOVE_BACK_WORKFLOW' // Required to move workflow back if needed
  ];
  for (const permName of ssmPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: strategicSupplyRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: strategicSupplyRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // Pricing Specialist permissions - Based on screenshots
  const pricingPermissions = [
    'VIEW_DASHBOARD',
    'VIEW_ITEM',
    'UPDATE_ITEM', // Required to update KINEXO pricing
    'VIEW_ALL_PROJECTS',
    'APPROVE_PRICING',
    'SUBMIT_PRICING',
    'VIEW_PRICING',
    'ADVANCE_WORKFLOW' // Required to advance workflow after submitting pricing
  ];
  for (const permName of pricingPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: pricingSpecialistRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: pricingSpecialistRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // Logistics permissions - Based on screenshots
  const logisticsPermissions = [
    'VIEW_DASHBOARD',
    'MANAGE_DCS', 'VIEW_DCS',
    'VIEW_ITEM',
    'UPDATE_ITEM', // Required to update freight strategy on items
    'VIEW_ALL_PROJECTS',
    'SUBMIT_FREIGHT_STRATEGY', 'VIEW_FREIGHT_STRATEGY',
    'VIEW_PRICING',
    'ADVANCE_WORKFLOW' // Required to advance workflow after submitting freight strategy
  ];
  for (const permName of logisticsPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: logisticsRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: logisticsRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // Create Users with passwords (default: password123)
  const defaultPassword = await hashPassword('password123');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cscs.com' },
    update: {
      password: defaultPassword, // Update password if user exists
    },
    create: {
      email: 'admin@cscs.com',
      name: 'Admin User',
      password: defaultPassword,
      roleId: adminRole.id,
    },
  });

  const cmUser = await prisma.user.upsert({
    where: { email: 'cm@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'cm@cscs.com',
      name: 'Category Manager',
      password: defaultPassword,
      roleId: categoryManagerRole.id,
    },
  });

  // Create additional test users
  const ssmUser = await prisma.user.upsert({
    where: { email: 'ssm@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'ssm@cscs.com',
      name: 'Strategic Supply Manager',
      password: defaultPassword,
      roleId: strategicSupplyRole.id,
    },
  });

  const pricingUser = await prisma.user.upsert({
    where: { email: 'pricing@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'pricing@cscs.com',
      name: 'Pricing Specialist',
      password: defaultPassword,
      roleId: pricingSpecialistRole.id,
    },
  });

  const logisticsUser = await prisma.user.upsert({
    where: { email: 'logistics@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'logistics@cscs.com',
      name: 'Logistics Manager',
      password: defaultPassword,
      roleId: logisticsRole.id,
    },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: 'supplier@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'supplier@cscs.com',
      name: 'Supplier Partner',
      password: defaultPassword,
      roleId: supplierRole.id,
    },
  });

  const dcOperatorUser = await prisma.user.upsert({
    where: { email: 'dcoperator@cscs.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      email: 'dcoperator@cscs.com',
      name: 'DC Operator',
      password: defaultPassword,
      roleId: dcOperatorRole.id,
    },
  });

  // Supplier permissions - Based on screenshots
  const supplierPermissions = [
    'VIEW_DASHBOARD',
    'VIEW_ITEM',
    'UPDATE_ITEM', // Required to update supplier pricing, item number, and specifications
    'VIEW_OWN_PROJECTS',
    'SUBMIT_SUPPLIER_PRICING'
  ];
  for (const permName of supplierPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: supplierRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: supplierRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // DC Operator permissions - Based on screenshots
  const dcOperatorPermissions = [
    'VIEW_DASHBOARD',
    'VIEW_DCS',
    'VIEW_ITEM',
    'VIEW_OWN_PROJECTS',
    'COMPLETE_DC_SETUP'
  ];
  for (const permName of dcOperatorPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dcOperatorRole.id,
            permissionId: permission.id,
          },
        },
        update: { granted: true },
        create: {
          roleId: dcOperatorRole.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  // Create test projects at different workflow stages for testing
  console.log('\nCreating test projects...');

  // 1. Project for Logistics - Freight Strategy stage
  const logisticsProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Office Supplies - Freight Strategy Review',
      description: 'New office supplies items requiring freight strategy setup',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Freight Strategy',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Premium Office Chair',
            description: 'Ergonomic office chair with lumbar support',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedByLogistics: true,
            freightStrategy: '',
          },
          {
            name: 'Standing Desk Converter',
            description: 'Adjustable standing desk converter',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedByLogistics: true,
            freightStrategy: '',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(logisticsProject.id, 'NEW_ITEM');
  // Set workflow to Freight Strategy stage (step 2)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: logisticsProject.id,
      stepOrder: { lte: 1 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: logisticsProject.id,
      stepOrder: 2,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Logistics project at Freight Strategy stage');

  // 2. Project for Pricing Specialist - KINEXO Pricing stage
  const pricingProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Electronics - Pricing Review',
      description: 'New electronics items requiring KINEXO pricing',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'KINEXO Pricing',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Wireless Mouse Pro',
            description: 'Premium wireless mouse with ergonomic design',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 25.99,
            kinexoPrice: null, // Needs to be set by pricing specialist
          },
          {
            name: 'Mechanical Keyboard',
            description: 'RGB mechanical keyboard with blue switches',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 89.99,
            kinexoPrice: null, // Needs to be set by pricing specialist
          },
          {
            name: 'USB-C Hub',
            description: '7-in-1 USB-C hub with HDMI, USB 3.0, and card reader',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 45.50,
            kinexoPrice: null, // Needs to be set by pricing specialist
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(pricingProject.id, 'NEW_ITEM');
  // Set workflow to KINEXO Pricing stage (step 4)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: pricingProject.id,
      stepOrder: { lte: 3 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: pricingProject.id,
      stepOrder: 4,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Pricing Specialist project at KINEXO Pricing stage');

  // 3. Project for Strategic Supply Manager - SSM Approval stage
  const ssmProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'IT Equipment - Strategic Review',
      description: 'IT equipment items pending strategic supply approval',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'SSM Approval',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Network Switch 24-Port',
            description: 'Managed network switch for office infrastructure',
            category: 'IT Equipment',
            ownedByCategoryManager: true,
            ownedByStrategicSupply: true,
            supplierPrice: 299.99,
            kinexoPrice: 349.99,
            freightStrategy: 'Standard Ground',
          },
          {
            name: 'Wireless Access Point',
            description: 'Enterprise-grade wireless access point',
            category: 'IT Equipment',
            ownedByCategoryManager: true,
            ownedByStrategicSupply: true,
            supplierPrice: 199.99,
            kinexoPrice: 229.99,
            freightStrategy: 'Standard Ground',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(ssmProject.id, 'NEW_ITEM');
  // Set workflow to SSM Approval stage (step 6)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: ssmProject.id,
      stepOrder: { lte: 5 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: ssmProject.id,
      stepOrder: 6,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Strategic Supply Manager project at SSM Approval stage');

  // 4. Project for Category Manager - Draft stage (new project)
  const cmDraftProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Kitchen Supplies - New Items',
      description: 'New kitchen supplies items for office break room',
      lifecycleType: 'NEW_ITEM',
      status: 'DRAFT',
      currentStage: 'Draft',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Coffee Maker Commercial',
            description: 'Commercial-grade coffee maker for office use',
            category: 'Kitchen Equipment',
            ownedByCategoryManager: true,
          },
          {
            name: 'Microwave Oven',
            description: 'Countertop microwave oven',
            category: 'Kitchen Equipment',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(cmDraftProject.id, 'NEW_ITEM');
  console.log('✓ Created Category Manager project at Draft stage');

  // 5. Project for Category Manager - CM Approval stage
  const cmApprovalProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Cleaning Supplies - Final Approval',
      description: 'Cleaning supplies items ready for Category Manager approval',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'CM Approval',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'All-Purpose Cleaner',
            description: 'Eco-friendly all-purpose cleaning solution',
            category: 'Cleaning Supplies',
            ownedByCategoryManager: true,
            supplierPrice: 12.99,
            kinexoPrice: 15.99,
            freightStrategy: 'Standard Ground',
          },
          {
            name: 'Paper Towels Bulk',
            description: 'Bulk paper towels for office use',
            category: 'Cleaning Supplies',
            ownedByCategoryManager: true,
            supplierPrice: 24.99,
            kinexoPrice: 29.99,
            freightStrategy: 'Standard Ground',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(cmApprovalProject.id, 'NEW_ITEM');
  // Set workflow to CM Approval stage (step 5)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: cmApprovalProject.id,
      stepOrder: { lte: 4 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: cmApprovalProject.id,
      stepOrder: 5,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Category Manager project at CM Approval stage');

  // 6. Transitioning Item project for variety
  const transitioningProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Office Furniture - Transition',
      description: 'Transitioning existing furniture items to new supplier',
      lifecycleType: 'TRANSITIONING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'KINEXO Pricing',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Conference Table (Updated)',
            description: 'Updated conference table with improved design',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 599.99,
            kinexoPrice: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(transitioningProject.id, 'TRANSITIONING_ITEM');
  // Set workflow to KINEXO Pricing stage (step 5 for TRANSITIONING_ITEM)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: transitioningProject.id,
      stepOrder: { lte: 4 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: transitioningProject.id,
      stepOrder: 5,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Transitioning Item project at KINEXO Pricing stage');

  // 7. Project for Supplier - Supplier Pricing stage
  const supplierProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Office Equipment - Supplier Pricing',
      description: 'New office equipment items requiring supplier pricing submission',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Supplier Pricing',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Ergonomic Desk Chair',
            description: 'Premium ergonomic office chair',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedBySupplier: true,
            supplierPrice: null, // Needs to be set by supplier
            supplierItemNumber: null,
            supplierSpecs: null,
          },
          {
            name: 'Adjustable Monitor Stand',
            description: 'Height-adjustable monitor stand',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedBySupplier: true,
            supplierPrice: null, // Needs to be set by supplier
            supplierItemNumber: null,
            supplierSpecs: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(supplierProject.id, 'NEW_ITEM');
  // Set workflow to Supplier Pricing stage (step 3)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: supplierProject.id,
      stepOrder: { lte: 2 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: supplierProject.id,
      stepOrder: 3,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Supplier project at Supplier Pricing stage');

  // 8. Project for DC Operator - In Transition stage
  const dcProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Warehouse Supplies - DC Setup',
      description: 'Warehouse supplies ready for distribution center setup',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'In Transition',
      createdById: cmUser.id,
      items: {
        create: [
          {
            name: 'Pallet Jack',
            description: 'Manual pallet jack for warehouse operations',
            category: 'Warehouse Equipment',
            ownedByCategoryManager: true,
            ownedByDCOperator: true,
            supplierPrice: 299.99,
            kinexoPrice: 349.99,
            freightStrategy: 'Standard Ground',
            dcStatus: null, // Needs to be set by DC Operator
            dcNotes: null,
          },
          {
            name: 'Storage Rack',
            description: 'Heavy-duty storage rack system',
            category: 'Warehouse Equipment',
            ownedByCategoryManager: true,
            ownedByDCOperator: true,
            supplierPrice: 499.99,
            kinexoPrice: 579.99,
            freightStrategy: 'Standard Ground',
            dcStatus: null, // Needs to be set by DC Operator
            dcNotes: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(dcProject.id, 'NEW_ITEM');
  // Set workflow to In Transition stage (step 7)
  await prisma.workflowStep.updateMany({
    where: {
      projectId: dcProject.id,
      stepOrder: { lte: 6 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: dcProject.id,
      stepOrder: 7,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created DC Operator project at In Transition stage');

  console.log('\nDatabase seeded successfully!');
  console.log('\nTest Users (password: password123):');
  console.log('Admin:', adminUser.email);
  console.log('Category Manager:', cmUser.email);
  console.log('Strategic Supply Manager:', ssmUser.email);
  console.log('Pricing Specialist:', pricingUser.email);
  console.log('Logistics:', logisticsUser.email);
  console.log('Supplier:', supplierUser.email);
  console.log('DC Operator:', dcOperatorUser.email);
  console.log('\nTest Projects Created:');
  console.log('- Logistics: Office Supplies (Freight Strategy stage)');
  console.log('- Pricing Specialist: Electronics (KINEXO Pricing stage)');
  console.log('- Strategic Supply Manager: IT Equipment (SSM Approval stage)');
  console.log('- Category Manager: Kitchen Supplies (Draft stage)');
  console.log('- Category Manager: Cleaning Supplies (CM Approval stage)');
  console.log('- Pricing Specialist: Office Furniture Transition (KINEXO Pricing stage)');
  console.log('- Supplier: Office Equipment (Supplier Pricing stage)');
  console.log('- DC Operator: Warehouse Supplies (In Transition stage)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

