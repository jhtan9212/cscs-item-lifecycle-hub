import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  console.log('Database seeded successfully!');
  console.log('\nTest Users (password: password123):');
  console.log('Admin:', adminUser.email);
  console.log('Category Manager:', cmUser.email);
  console.log('Strategic Supply Manager:', ssmUser.email);
  console.log('Pricing Specialist:', pricingUser.email);
  console.log('Logistics:', logisticsUser.email);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

