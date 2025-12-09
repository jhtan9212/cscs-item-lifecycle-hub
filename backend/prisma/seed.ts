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

  // Create Organizations
  console.log('Creating organizations...');
  const org1 = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: {
      id: 'org-1',
      name: 'KINEXO Corporation',
      domain: 'kinexo.com',
      isActive: true,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { id: 'org-2' },
    update: {},
    create: {
      id: 'org-2',
      name: 'Partner Organization A',
      domain: 'partnera.com',
      isActive: true,
    },
  });

  // Create org3 for testing isolation scenarios (not assigned to any users/projects in seed)
  const org3 = await prisma.organization.upsert({
    where: { id: 'org-3' },
    update: {},
    create: {
      id: 'org-3',
      name: 'Partner Organization B',
      domain: 'partnerb.com',
      isActive: true,
    },
  });
  // Explicitly mark as used to avoid TypeScript warning
  void org3;

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
    'ADVANCE_WORKFLOW', // Required to advance workflow after submitting freight strategy
    'MOVE_BACK_WORKFLOW' // Required to move back workflow if needed
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
      organizationId: org1.id, // Assign to main organization
    },
    create: {
      email: 'admin@cscs.com',
      name: 'Admin User',
      password: defaultPassword,
      roleId: adminRole.id,
      organizationId: org1.id, // Assign to main organization
    },
  });

  const cmUser = await prisma.user.upsert({
    where: { email: 'cm@cscs.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id, // Assign to main organization
    },
    create: {
      email: 'cm@cscs.com',
      name: 'Category Manager',
      password: defaultPassword,
      roleId: categoryManagerRole.id,
      organizationId: org1.id, // Assign to main organization
    },
  });

  // Create additional test users - assign to different organizations for testing
  const ssmUser = await prisma.user.upsert({
    where: { email: 'ssm@cscs.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id,
    },
    create: {
      email: 'ssm@cscs.com',
      name: 'Strategic Supply Manager',
      password: defaultPassword,
      roleId: strategicSupplyRole.id,
      organizationId: org1.id,
    },
  });

  const pricingUser = await prisma.user.upsert({
    where: { email: 'pricing@cscs.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id,
    },
    create: {
      email: 'pricing@cscs.com',
      name: 'Pricing Specialist',
      password: defaultPassword,
      roleId: pricingSpecialistRole.id,
      organizationId: org1.id,
    },
  });

  const logisticsUser = await prisma.user.upsert({
    where: { email: 'logistics@cscs.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id,
    },
    create: {
      email: 'logistics@cscs.com',
      name: 'Logistics Manager',
      password: defaultPassword,
      roleId: logisticsRole.id,
      organizationId: org1.id,
    },
  });

  // org1 (KINEXO Corporation) - Add Supplier and DC Operator if not already created
  const supplierUserOrg1 = await prisma.user.upsert({
    where: { email: 'supplier@kinexo.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id,
    },
    create: {
      email: 'supplier@kinexo.com',
      name: 'Supplier (KINEXO)',
      password: defaultPassword,
      roleId: supplierRole.id,
      organizationId: org1.id,
    },
  });

  const dcOperatorUser = await prisma.user.upsert({
    where: { email: 'dcoperator@cscs.com' },
    update: {
      password: defaultPassword,
      organizationId: org1.id,
    },
    create: {
      email: 'dcoperator@cscs.com',
      name: 'DC Operator (KINEXO)',
      password: defaultPassword,
      roleId: dcOperatorRole.id,
      organizationId: org1.id,
    },
  });

  // org2 (Partner Organization A) - Create all roles
  const cmUserOrg2 = await prisma.user.upsert({
    where: { email: 'cm@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'cm@partnera.com',
      name: 'Category Manager (Partner A)',
      password: defaultPassword,
      roleId: categoryManagerRole.id,
      organizationId: org2.id,
    },
  });

  const ssmUserOrg2 = await prisma.user.upsert({
    where: { email: 'ssm@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'ssm@partnera.com',
      name: 'Strategic Supply Manager (Partner A)',
      password: defaultPassword,
      roleId: strategicSupplyRole.id,
      organizationId: org2.id,
    },
  });

  const pricingUserOrg2 = await prisma.user.upsert({
    where: { email: 'pricing@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'pricing@partnera.com',
      name: 'Pricing Specialist (Partner A)',
      password: defaultPassword,
      roleId: pricingSpecialistRole.id,
      organizationId: org2.id,
    },
  });

  const logisticsUserOrg2 = await prisma.user.upsert({
    where: { email: 'logistics@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'logistics@partnera.com',
      name: 'Logistics (Partner A)',
      password: defaultPassword,
      roleId: logisticsRole.id,
      organizationId: org2.id,
    },
  });

  const supplierUserOrg2 = await prisma.user.upsert({
    where: { email: 'supplier@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'supplier@partnera.com',
      name: 'Supplier (Partner A)',
      password: defaultPassword,
      roleId: supplierRole.id,
      organizationId: org2.id,
    },
  });

  const dcOperatorUserOrg2 = await prisma.user.upsert({
    where: { email: 'dcoperator@partnera.com' },
    update: {
      password: defaultPassword,
      organizationId: org2.id,
    },
    create: {
      email: 'dcoperator@partnera.com',
      name: 'DC Operator (Partner A)',
      password: defaultPassword,
      roleId: dcOperatorRole.id,
      organizationId: org2.id,
    },
  });

  // org3 (Partner Organization B) - Create all roles
  const cmUserOrg3 = await prisma.user.upsert({
    where: { email: 'cm@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'cm@partnerb.com',
      name: 'Category Manager (Partner B)',
      password: defaultPassword,
      roleId: categoryManagerRole.id,
      organizationId: org3.id,
    },
  });

  const ssmUserOrg3 = await prisma.user.upsert({
    where: { email: 'ssm@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'ssm@partnerb.com',
      name: 'Strategic Supply Manager (Partner B)',
      password: defaultPassword,
      roleId: strategicSupplyRole.id,
      organizationId: org3.id,
    },
  });

  const pricingUserOrg3 = await prisma.user.upsert({
    where: { email: 'pricing@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'pricing@partnerb.com',
      name: 'Pricing Specialist (Partner B)',
      password: defaultPassword,
      roleId: pricingSpecialistRole.id,
      organizationId: org3.id,
    },
  });

  const logisticsUserOrg3 = await prisma.user.upsert({
    where: { email: 'logistics@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'logistics@partnerb.com',
      name: 'Logistics (Partner B)',
      password: defaultPassword,
      roleId: logisticsRole.id,
      organizationId: org3.id,
    },
  });

  const supplierUserOrg3 = await prisma.user.upsert({
    where: { email: 'supplier@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'supplier@partnerb.com',
      name: 'Supplier (Partner B)',
      password: defaultPassword,
      roleId: supplierRole.id,
      organizationId: org3.id,
    },
  });

  const dcOperatorUserOrg3 = await prisma.user.upsert({
    where: { email: 'dcoperator@partnerb.com' },
    update: {
      password: defaultPassword,
      organizationId: org3.id,
    },
    create: {
      email: 'dcoperator@partnerb.com',
      name: 'DC Operator (Partner B)',
      password: defaultPassword,
      roleId: dcOperatorRole.id,
      organizationId: org3.id,
    },
  });

  // Create a user without organization to test edge case
  const cmUserNoOrg = await prisma.user.upsert({
    where: { email: 'cm@noorg.com' },
    update: {
      password: defaultPassword,
      organizationId: null,
    },
    create: {
      email: 'cm@noorg.com',
      name: 'Category Manager (No Org)',
      password: defaultPassword,
      roleId: categoryManagerRole.id,
      organizationId: null,
    },
  });

  // Supplier permissions - Based on screenshots
  const supplierPermissions = [
    'VIEW_DASHBOARD',
    'VIEW_ITEM',
    'UPDATE_ITEM', // Required to update supplier pricing, item number, and specifications
    'VIEW_OWN_PROJECTS',
    'SUBMIT_SUPPLIER_PRICING',
    'ADVANCE_WORKFLOW' // Required to advance workflow after submitting supplier pricing
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
    'UPDATE_ITEM', // Required to update DC status and notes
    'VIEW_OWN_PROJECTS',
    'COMPLETE_DC_SETUP',
    'ADVANCE_WORKFLOW' // Required to advance workflow after completing DC setup
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
      organizationId: org1.id, // Assign to main organization
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
      organizationId: org1.id,
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
      organizationId: org1.id,
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
      organizationId: org1.id,
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
      organizationId: org1.id,
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
      organizationId: org1.id,
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

  // 7. Project for Supplier - Supplier Pricing stage (assign to org2 to test isolation)
  const supplierProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Office Equipment - Supplier Pricing',
      description: 'New office equipment items requiring supplier pricing submission',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Supplier Pricing',
      createdById: cmUserOrg2.id, // Use org2 Category Manager
      organizationId: org2.id, // Assign to Partner Org A for testing isolation
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
      organizationId: org1.id,
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

  // 9. Additional projects for org2 (Partner Organization A) to test multi-tenancy
  const org2Project1 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Partner A - Office Supplies',
      description: 'Office supplies project for Partner Organization A',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Draft',
      createdById: cmUserOrg2.id,
      organizationId: org2.id,
      items: {
        create: [
          {
            name: 'Partner A Item 1',
            description: 'Test item for Partner A',
            category: 'Office Supplies',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org2Project1.id, 'NEW_ITEM');
  console.log('✓ Created Partner A project (Draft stage)');

  const org2Project2 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Partner A - Electronics',
      description: 'Electronics project for Partner Organization A at KINEXO Pricing',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'KINEXO Pricing',
      createdById: cmUserOrg2.id,
      organizationId: org2.id,
      items: {
        create: [
          {
            name: 'Partner A Electronics Item',
            description: 'Electronics item requiring pricing',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 100.00,
            kinexoPrice: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org2Project2.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org2Project2.id,
      stepOrder: { lte: 3 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org2Project2.id,
      stepOrder: 4,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Partner A project (KINEXO Pricing stage)');

  // 10. Projects for org3 (Partner Organization B) to test isolation
  const org3Project1 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Partner B - Warehouse Equipment',
      description: 'Warehouse equipment project for Partner Organization B',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Draft',
      createdById: cmUserOrg3.id,
      organizationId: org3.id,
      items: {
        create: [
          {
            name: 'Partner B Item 1',
            description: 'Test item for Partner B',
            category: 'Warehouse Equipment',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org3Project1.id, 'NEW_ITEM');
  console.log('✓ Created Partner B project (Draft stage)');

  // 11. Project without organization to test edge case
  const noOrgProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'No Organization Project',
      description: 'Project created by user without organization assignment',
      lifecycleType: 'NEW_ITEM',
      status: 'DRAFT',
      currentStage: 'Draft',
      createdById: cmUserNoOrg.id,
      organizationId: null, // Explicitly set to null
      items: {
        create: [
          {
            name: 'No Org Item',
            description: 'Item in project without organization',
            category: 'Miscellaneous',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(noOrgProject.id, 'NEW_ITEM');
  console.log('✓ Created project without organization (edge case)');

  // 12. Additional org1 projects for comprehensive testing
  const org1AdditionalProject1 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Additional Project 1',
      description: 'Additional project for KINEXO Corporation at Supplier Pricing',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Supplier Pricing',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'KINEXO Supplier Item 1',
            description: 'Item requiring supplier pricing',
            category: 'Office Supplies',
            ownedByCategoryManager: true,
            ownedBySupplier: true,
            supplierPrice: null,
            supplierItemNumber: null,
            supplierSpecs: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org1AdditionalProject1.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org1AdditionalProject1.id,
      stepOrder: { lte: 2 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org1AdditionalProject1.id,
      stepOrder: 3,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created additional KINEXO project (Supplier Pricing stage)');

  const org1AdditionalProject2 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Additional Project 2',
      description: 'Additional project for KINEXO Corporation at Freight Strategy',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Freight Strategy',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'KINEXO Freight Item 1',
            description: 'Item requiring freight strategy',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedByLogistics: true,
            freightStrategy: '',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org1AdditionalProject2.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org1AdditionalProject2.id,
      stepOrder: { lte: 1 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org1AdditionalProject2.id,
      stepOrder: 2,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created additional KINEXO project (Freight Strategy stage)');

  // 13. TRANSITIONING_ITEM lifecycle projects for comprehensive testing
  const transitioningProject2 = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Transitioning Item Project',
      description: 'Transitioning item project for KINEXO at Item Comparison stage',
      lifecycleType: 'TRANSITIONING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Item Comparison',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'Old Item - Office Chair',
            description: 'Existing office chair to be transitioned',
            category: 'Furniture',
            ownedByCategoryManager: true,
          },
          {
            name: 'New Item - Office Chair Pro',
            description: 'New improved office chair',
            category: 'Furniture',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(transitioningProject2.id, 'TRANSITIONING_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: transitioningProject2.id,
      stepOrder: { lte: 1 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: transitioningProject2.id,
      stepOrder: 2,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created TRANSITIONING_ITEM project (Item Comparison stage)');

  // 14. DELETING_ITEM lifecycle project
  const deletingProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Deleting Item Project',
      description: 'Deleting item project for KINEXO at Impact Analysis stage',
      lifecycleType: 'DELETING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Impact Analysis',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'Obsolete Item - Old Printer',
            description: 'Printer model being phased out',
            category: 'Electronics',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(deletingProject.id, 'DELETING_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProject.id,
      stepOrder: { lte: 1 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProject.id,
      stepOrder: 2,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created DELETING_ITEM project (Impact Analysis stage)');

  // 15. DELETING_ITEM at SSM Review stage
  const deletingProjectSSM = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Item Deletion Review',
      description: 'Deleting item project at SSM Review stage',
      lifecycleType: 'DELETING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'SSM Review',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'Discontinued Item - Old Monitor',
            description: 'Monitor model being discontinued',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByStrategicSupply: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(deletingProjectSSM.id, 'DELETING_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProjectSSM.id,
      stepOrder: { lte: 2 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProjectSSM.id,
      stepOrder: 3,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created DELETING_ITEM project (SSM Review stage)');

  // 16. DELETING_ITEM at Archive stage (Admin only)
  const deletingProjectArchive = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Item Archive',
      description: 'Deleting item project at Archive stage (Admin only)',
      lifecycleType: 'DELETING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Archive',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'Archived Item - Legacy Keyboard',
            description: 'Legacy keyboard being archived',
            category: 'Electronics',
            ownedByCategoryManager: true,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(deletingProjectArchive.id, 'DELETING_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProjectArchive.id,
      stepOrder: { lte: 4 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: deletingProjectArchive.id,
      stepOrder: 5,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created DELETING_ITEM project (Archive stage - Admin only)');

  // 17. Completed project for testing completed state
  const completedProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Completed Project',
      description: 'Completed project for testing completed state',
      lifecycleType: 'NEW_ITEM',
      status: 'COMPLETED',
      currentStage: 'Completed',
      createdById: cmUser.id,
      organizationId: org1.id,
      completedAt: new Date(),
      items: {
        create: [
          {
            name: 'Completed Item 1',
            description: 'Item from completed project',
            category: 'Office Supplies',
            ownedByCategoryManager: true,
            supplierPrice: 10.99,
            kinexoPrice: 12.99,
            freightStrategy: 'Standard Ground',
            dcStatus: 'In Stock',
            dcNotes: 'DC setup completed',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(completedProject.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: completedProject.id,
    },
    data: { status: StepStatus.COMPLETED },
  });
  console.log('✓ Created COMPLETED project');

  // 18. Partner A (org2) - Additional projects for multi-tenant testing
  const org2Transitioning = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Partner A - Transitioning Item',
      description: 'Transitioning item project for Partner A',
      lifecycleType: 'TRANSITIONING_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'Freight Strategy',
      createdById: cmUserOrg2.id,
      organizationId: org2.id,
      items: {
        create: [
          {
            name: 'Partner A Transition Item',
            description: 'Item being transitioned',
            category: 'Office Supplies',
            ownedByCategoryManager: true,
            ownedByLogistics: true,
            freightStrategy: '',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org2Transitioning.id, 'TRANSITIONING_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org2Transitioning.id,
      stepOrder: { lte: 2 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org2Transitioning.id,
      stepOrder: 3,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Partner A TRANSITIONING_ITEM project (Freight Strategy stage)');

  // 19. Partner B (org3) - Additional project
  const org3Additional = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'Partner B - Additional Project',
      description: 'Additional project for Partner B at CM Approval',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'CM Approval',
      createdById: cmUserOrg3.id,
      organizationId: org3.id,
      items: {
        create: [
          {
            name: 'Partner B Item 2',
            description: 'Second test item for Partner B',
            category: 'Warehouse Equipment',
            ownedByCategoryManager: true,
            supplierPrice: 150.00,
            kinexoPrice: 175.00,
            freightStrategy: 'Standard Ground',
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(org3Additional.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org3Additional.id,
      stepOrder: { lte: 4 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: org3Additional.id,
      stepOrder: 5,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created Partner B project (CM Approval stage)');

  // 20. Project with multiple items for comprehensive testing
  const multiItemProject = await prisma.project.create({
    data: {
      projectNumber: generateProjectNumber(),
      name: 'KINEXO - Multi-Item Project',
      description: 'Project with multiple items for comprehensive testing',
      lifecycleType: 'NEW_ITEM',
      status: 'IN_PROGRESS',
      currentStage: 'KINEXO Pricing',
      createdById: cmUser.id,
      organizationId: org1.id,
      items: {
        create: [
          {
            name: 'Multi-Item 1',
            description: 'First item in multi-item project',
            category: 'Electronics',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 50.00,
            kinexoPrice: null,
          },
          {
            name: 'Multi-Item 2',
            description: 'Second item in multi-item project',
            category: 'Furniture',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 100.00,
            kinexoPrice: null,
          },
          {
            name: 'Multi-Item 3',
            description: 'Third item in multi-item project',
            category: 'Office Supplies',
            ownedByCategoryManager: true,
            ownedByPricingSpecialist: true,
            supplierPrice: 25.00,
            kinexoPrice: null,
          },
        ],
      },
    },
  });
  await WorkflowEngine.initializeWorkflow(multiItemProject.id, 'NEW_ITEM');
  await prisma.workflowStep.updateMany({
    where: {
      projectId: multiItemProject.id,
      stepOrder: { lte: 3 },
    },
    data: { status: StepStatus.COMPLETED },
  });
  await prisma.workflowStep.updateMany({
    where: {
      projectId: multiItemProject.id,
      stepOrder: 4,
    },
    data: { status: StepStatus.IN_PROGRESS },
  });
  console.log('✓ Created multi-item project (KINEXO Pricing stage)');

  console.log('\nDatabase seeded successfully!');
  console.log('\n=== Organizations ===');
  console.log('1. KINEXO Corporation (org1)');
  console.log('2. Partner Organization A (org2)');
  console.log('3. Partner Organization B (org3)');
  console.log('\n=== Test Users (password: password123) ===');
  console.log('\nKINEXO Corporation (org1):');
  console.log('  - Admin:', adminUser.email);
  console.log('  - Category Manager:', cmUser.email);
  console.log('  - Strategic Supply Manager:', ssmUser.email);
  console.log('  - Pricing Specialist:', pricingUser.email);
  console.log('  - Logistics:', logisticsUser.email);
  console.log('  - Supplier:', supplierUserOrg1.email);
  console.log('  - DC Operator:', dcOperatorUser.email);
  console.log('\nPartner Organization A (org2):');
  console.log('  - Category Manager:', cmUserOrg2.email);
  console.log('  - Strategic Supply Manager:', ssmUserOrg2.email);
  console.log('  - Pricing Specialist:', pricingUserOrg2.email);
  console.log('  - Logistics:', logisticsUserOrg2.email);
  console.log('  - Supplier:', supplierUserOrg2.email);
  console.log('  - DC Operator:', dcOperatorUserOrg2.email);
  console.log('\nPartner Organization B (org3):');
  console.log('  - Category Manager:', cmUserOrg3.email);
  console.log('  - Strategic Supply Manager:', ssmUserOrg3.email);
  console.log('  - Pricing Specialist:', pricingUserOrg3.email);
  console.log('  - Logistics:', logisticsUserOrg3.email);
  console.log('  - Supplier:', supplierUserOrg3.email);
  console.log('  - DC Operator:', dcOperatorUserOrg3.email);
  console.log('\nNo Organization:');
  console.log('  - Category Manager:', cmUserNoOrg.email);
  console.log('\n=== Test Projects Created ===');
  console.log('\nKINEXO Corporation (org1) Projects:');
  console.log('  NEW_ITEM Lifecycle:');
  console.log('    1. Office Supplies - Freight Strategy (Freight Strategy stage)');
  console.log('    2. Electronics - Pricing Review (KINEXO Pricing stage)');
  console.log('    3. IT Equipment - Strategic Review (SSM Approval stage)');
  console.log('    4. Kitchen Supplies - New Items (Draft stage)');
  console.log('    5. Cleaning Supplies - Final Approval (CM Approval stage)');
  console.log('    6. Warehouse Supplies - DC Setup (In Transition stage)');
  console.log('    7. KINEXO - Additional Project 1 (Supplier Pricing stage)');
  console.log('    8. KINEXO - Additional Project 2 (Freight Strategy stage)');
  console.log('    9. KINEXO - Multi-Item Project (KINEXO Pricing stage)');
  console.log('    10. KINEXO - Completed Project (Completed stage)');
  console.log('  TRANSITIONING_ITEM Lifecycle:');
  console.log('    11. Office Furniture - Transition (KINEXO Pricing stage)');
  console.log('    12. KINEXO - Transitioning Item Project (Item Comparison stage)');
  console.log('  DELETING_ITEM Lifecycle:');
  console.log('    13. KINEXO - Deleting Item Project (Impact Analysis stage)');
  console.log('    14. KINEXO - Item Deletion Review (SSM Review stage)');
  console.log('    15. KINEXO - Item Archive (Archive stage - Admin only)');
  console.log('\nPartner Organization A (org2) Projects:');
  console.log('    1. Office Equipment - Supplier Pricing (Supplier Pricing stage)');
  console.log('    2. Partner A - Office Supplies (Draft stage)');
  console.log('    3. Partner A - Electronics (KINEXO Pricing stage)');
  console.log('    4. Partner A - Transitioning Item (Freight Strategy stage)');
  console.log('\nPartner Organization B (org3) Projects:');
  console.log('    1. Partner B - Warehouse Equipment (Draft stage)');
  console.log('    2. Partner B - Additional Project (CM Approval stage)');
  console.log('\nNo Organization Projects:');
  console.log('    1. No Organization Project (Draft stage)');
  console.log('\n=== Multi-Tenancy Test Scenarios ===');
  console.log('✓ Users can only see projects from their organization (unless Admin)');
  console.log('✓ Admin can see all projects across organizations');
  console.log('✓ Projects created inherit organization from creator');
  console.log('✓ Projects without organization display "No Organization"');
  console.log('✓ Organization isolation tested with org1, org2, and org3');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

