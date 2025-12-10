import prisma from '../config/database';
import { logger } from '../utils/logger';

export class VersionService {
  /**
   * Create a version snapshot of an item
   */
  static async createItemVersion(itemId: string, userId: string): Promise<void> {
    try {
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error('Item not found');
      }

      // Get the latest version number
      const latestVersion = await prisma.itemVersion.findFirst({
        where: { itemId },
        orderBy: { versionNumber: 'desc' },
      });

      const nextVersion = (latestVersion?.versionNumber || 0) + 1;

      // Create version snapshot
      await prisma.itemVersion.create({
        data: {
          itemId,
          versionNumber: nextVersion,
          data: JSON.stringify(item),
          createdById: userId,
        },
      });

      logger.info('Item version created', { itemId, versionNumber: nextVersion });
    } catch (error: any) {
      logger.error('Error creating item version:', { itemId, error: error.message });
      throw error;
    }
  }

  /**
   * Create a version snapshot of a project
   */
  static async createProjectVersion(projectId: string, userId: string): Promise<void> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          items: true,
          workflowSteps: true,
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Get the latest version number
      const latestVersion = await prisma.projectVersion.findFirst({
        where: { projectId },
        orderBy: { versionNumber: 'desc' },
      });

      const nextVersion = (latestVersion?.versionNumber || 0) + 1;

      // Create version snapshot
      await prisma.projectVersion.create({
        data: {
          projectId,
          versionNumber: nextVersion,
          data: JSON.stringify(project),
          createdById: userId,
        },
      });

      logger.info('Project version created', { projectId, versionNumber: nextVersion });
    } catch (error: any) {
      logger.error('Error creating project version:', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all versions for an item
   */
  static async getItemVersions(itemId: string) {
    try {
      return await prisma.itemVersion.findMany({
        where: { itemId },
        orderBy: { versionNumber: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching item versions:', { itemId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all versions for a project
   */
  static async getProjectVersions(projectId: string) {
    try {
      return await prisma.projectVersion.findMany({
        where: { projectId },
        orderBy: { versionNumber: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              projectNumber: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching project versions:', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Get a specific version of an item
   */
  static async getItemVersion(itemId: string, versionNumber: number) {
    try {
      const version = await prisma.itemVersion.findFirst({
        where: {
          itemId,
          versionNumber,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!version) {
        throw new Error('Version not found');
      }

      return {
        ...version,
        data: JSON.parse(version.data),
      };
    } catch (error: any) {
      logger.error('Error fetching item version:', { itemId, versionNumber, error: error.message });
      throw error;
    }
  }

  /**
   * Get a specific version of a project
   */
  static async getProjectVersion(projectId: string, versionNumber: number) {
    try {
      const version = await prisma.projectVersion.findFirst({
        where: {
          projectId,
          versionNumber,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!version) {
        throw new Error('Version not found');
      }

      return {
        ...version,
        data: JSON.parse(version.data),
      };
    } catch (error: any) {
      logger.error('Error fetching project version:', { projectId, versionNumber, error: error.message });
      throw error;
    }
  }
}

