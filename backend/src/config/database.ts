import { PrismaClient } from '@prisma/client';

// Configure Prisma client with safe defaults
// Note: Prisma connects lazily on first query, so we don't need to call $connect() explicitly
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] // Reduced logging to prevent potential issues with query logging
    : ['error'],
  errorFormat: 'pretty',
});

// Graceful shutdown - disconnect Prisma on process termination
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export default prisma;

