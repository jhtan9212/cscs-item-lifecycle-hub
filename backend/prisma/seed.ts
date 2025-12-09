import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cscs.com' },
    update: {},
    create: {
      email: 'admin@cscs.com',
      name: 'Admin User',
      roleId: adminRole.id,
    },
  });

  const cmUser = await prisma.user.upsert({
    where: { email: 'cm@cscs.com' },
    update: {},
    create: {
      email: 'cm@cscs.com',
      name: 'Category Manager',
      roleId: categoryManagerRole.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user:', adminUser.email);
  console.log('Category Manager user:', cmUser.email);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

