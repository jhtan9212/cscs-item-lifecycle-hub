import { PrismaClient, LifecycleType, StepStatus } from '@prisma/client';
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

  // Create Permissions
  const permissions = [
    { name: 'CREATE_PROJECT', category: 'Projects', description: 'Create new projects' },
    { name: 'UPDATE_PROJECT', category: 'Projects', description: 'Update projects' },
    { name: 'DELETE_PROJECT', category: 'Projects', description: 'Delete projects' },
    { name: 'VIEW_PROJECT', category: 'Projects', description: 'View projects' },
    { name: 'CREATE_ITEM', category: 'Items', description: 'Create items' },
    { name: 'UPDATE_ITEM', category: 'Items', description: 'Update items' },
    { name: 'DELETE_ITEM', category: 'Items', description: 'Delete items' },
    { name: 'VIEW_ITEM', category: 'Items', description: 'View items' },
    { name: 'ADVANCE_WORKFLOW', category: 'Workflow', description: 'Advance workflow stages' },
    { name: 'MOVE_BACK_WORKFLOW', category: 'Workflow', description: 'Move workflow back' },
    { name: 'APPROVE_PRICING', category: 'Pricing', description: 'Approve pricing' },
    { name: 'SUBMIT_PRICING', category: 'Pricing', description: 'Submit pricing' },
    { name: 'VIEW_PRICING', category: 'Pricing', description: 'View pricing' },
    { name: 'MANAGE_USERS', category: 'Users', description: 'Manage users' },
    { name: 'MANAGE_ROLES', category: 'Users', description: 'Manage roles' },
    { name: 'MANAGE_PERMISSIONS', category: 'Users', description: 'Manage permissions' },
    { name: 'VIEW_AUDIT_LOGS', category: 'Audit', description: 'View audit logs' },
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

  // Category Manager permissions
  const cmPermissions = ['CREATE_PROJECT', 'UPDATE_PROJECT', 'VIEW_PROJECT', 'CREATE_ITEM', 'UPDATE_ITEM', 'VIEW_ITEM', 'ADVANCE_WORKFLOW', 'MOVE_BACK_WORKFLOW', 'APPROVE_PRICING', 'VIEW_PRICING'];
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

  // Strategic Supply Manager permissions
  const ssmPermissions = ['VIEW_PROJECT', 'VIEW_ITEM', 'VIEW_PRICING', 'ADVANCE_WORKFLOW'];
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

  // Pricing Specialist permissions
  const pricingPermissions = ['VIEW_PROJECT', 'VIEW_ITEM', 'SUBMIT_PRICING', 'VIEW_PRICING', 'UPDATE_ITEM'];
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

  // Logistics permissions
  const logisticsPermissions = ['VIEW_PROJECT', 'VIEW_ITEM', 'UPDATE_ITEM', 'VIEW_PRICING'];
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

  console.log('\nDatabase seeded successfully!');
  console.log('\nTest Users (password: password123):');
  console.log('Admin:', adminUser.email);
  console.log('Category Manager:', cmUser.email);
  console.log('Strategic Supply Manager:', ssmUser.email);
  console.log('Pricing Specialist:', pricingUser.email);
  console.log('Logistics:', logisticsUser.email);
  console.log('\nTest Projects Created:');
  console.log('- Logistics: Office Supplies (Freight Strategy stage)');
  console.log('- Pricing Specialist: Electronics (KINEXO Pricing stage)');
  console.log('- Strategic Supply Manager: IT Equipment (SSM Approval stage)');
  console.log('- Category Manager: Kitchen Supplies (Draft stage)');
  console.log('- Category Manager: Cleaning Supplies (CM Approval stage)');
  console.log('- Pricing Specialist: Office Furniture Transition (KINEXO Pricing stage)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

