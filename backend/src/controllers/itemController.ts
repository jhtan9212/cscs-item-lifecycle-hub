import { Request, Response } from 'express';
import prisma from '../config/database';

export const getItemsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const items = await prisma.item.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      name,
      description,
      category,
      itemNumber,
      cmItemNumber,
      cmDescription,
      cmCategory,
      ssSupplier,
      supplierPrice,
      kinexoPrice,
      freightStrategy,
      supplierItemNumber,
      ownedByCategoryManager,
      ownedByStrategicSupply,
      ownedByPricingSpecialist,
      ownedByLogistics,
      ownedBySupplier,
      ownedByDCOperator,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const item = await prisma.item.create({
      data: {
        projectId,
        name,
        description,
        category,
        itemNumber,
        cmItemNumber,
        cmDescription,
        cmCategory,
        ssSupplier,
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : null,
        kinexoPrice: kinexoPrice ? parseFloat(kinexoPrice) : null,
        freightStrategy,
        supplierItemNumber,
        ownedByCategoryManager: ownedByCategoryManager ?? false,
        ownedByStrategicSupply: ownedByStrategicSupply ?? false,
        ownedByPricingSpecialist: ownedByPricingSpecialist ?? false,
        ownedByLogistics: ownedByLogistics ?? false,
        ownedBySupplier: ownedBySupplier ?? false,
        ownedByDCOperator: ownedByDCOperator ?? false,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId,
        userId: project.createdById,
        action: 'CREATE_ITEM',
        entityType: 'ITEM',
        entityId: item.id,
      },
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Convert price strings to floats if provided
    if (updateData.supplierPrice !== undefined) {
      updateData.supplierPrice = updateData.supplierPrice ? parseFloat(updateData.supplierPrice) : null;
    }
    if (updateData.kinexoPrice !== undefined) {
      updateData.kinexoPrice = updateData.kinexoPrice ? parseFloat(updateData.kinexoPrice) : null;
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: item.projectId,
        userId: item.project.createdById,
        action: 'UPDATE_ITEM',
        entityType: 'ITEM',
        entityId: id,
        changes: JSON.stringify(updateData),
      },
    });

    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prisma.item.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: item.projectId,
        userId: item.project.createdById,
        action: 'DELETE_ITEM',
        entityType: 'ITEM',
        entityId: id,
      },
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

