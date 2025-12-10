import { Request, Response } from 'express';
import prisma from '../config/database';
import { VersionService } from '../services/versionService';
import { EventService } from '../services/eventService';

export const getItemsByProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectId } = req.params;

    const items = await prisma.item.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getItem = async (req: Request, res: Response): Promise<Response> => {
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

    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createItem = async (req: Request, res: Response): Promise<Response> => {
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
      freightBrackets,
      supplierItemNumber,
      supplierSpecs,
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

    // Validate price fields
    if (supplierPrice !== undefined && supplierPrice !== null) {
      const price = parseFloat(supplierPrice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Supplier price must be a positive number' });
      }
    }
    if (kinexoPrice !== undefined && kinexoPrice !== null) {
      const price = parseFloat(kinexoPrice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'KINEXO price must be a positive number' });
      }
    }

    // Validate JSON fields
    let validatedFreightBrackets = null;
    if (freightBrackets) {
      try {
        validatedFreightBrackets = typeof freightBrackets === 'string' 
          ? JSON.parse(freightBrackets) 
          : freightBrackets;
        // Ensure it's a valid object
        if (typeof validatedFreightBrackets !== 'object' || Array.isArray(validatedFreightBrackets)) {
          return res.status(400).json({ error: 'Freight brackets must be a valid JSON object' });
        }
        validatedFreightBrackets = JSON.stringify(validatedFreightBrackets);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON format for freight brackets' });
      }
    }

    let validatedSupplierSpecs = null;
    if (supplierSpecs) {
      try {
        validatedSupplierSpecs = typeof supplierSpecs === 'string' 
          ? JSON.parse(supplierSpecs) 
          : supplierSpecs;
        // Ensure it's a valid object
        if (typeof validatedSupplierSpecs !== 'object' || Array.isArray(validatedSupplierSpecs)) {
          return res.status(400).json({ error: 'Supplier specifications must be a valid JSON object' });
        }
        validatedSupplierSpecs = JSON.stringify(validatedSupplierSpecs);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON format for supplier specifications' });
      }
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
        freightBrackets: validatedFreightBrackets,
        supplierItemNumber,
        supplierSpecs: validatedSupplierSpecs,
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

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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

    // Validate and convert price fields
    if (updateData.supplierPrice !== undefined && updateData.supplierPrice !== null) {
      const price = parseFloat(updateData.supplierPrice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Supplier price must be a positive number' });
      }
      updateData.supplierPrice = price;
    } else if (updateData.supplierPrice === null) {
      updateData.supplierPrice = null;
    }

    if (updateData.kinexoPrice !== undefined && updateData.kinexoPrice !== null) {
      const price = parseFloat(updateData.kinexoPrice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'KINEXO price must be a positive number' });
      }
      updateData.kinexoPrice = price;
    } else if (updateData.kinexoPrice === null) {
      updateData.kinexoPrice = null;
    }

    // Validate JSON fields
    if (updateData.freightBrackets !== undefined) {
      if (updateData.freightBrackets === null || updateData.freightBrackets === '') {
        updateData.freightBrackets = null;
      } else {
        try {
          const parsed = typeof updateData.freightBrackets === 'string' 
            ? JSON.parse(updateData.freightBrackets) 
            : updateData.freightBrackets;
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            return res.status(400).json({ error: 'Freight brackets must be a valid JSON object' });
          }
          updateData.freightBrackets = JSON.stringify(parsed);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid JSON format for freight brackets' });
        }
      }
    }

    if (updateData.supplierSpecs !== undefined) {
      if (updateData.supplierSpecs === null || updateData.supplierSpecs === '') {
        updateData.supplierSpecs = null;
      } else {
        try {
          const parsed = typeof updateData.supplierSpecs === 'string' 
            ? JSON.parse(updateData.supplierSpecs) 
            : updateData.supplierSpecs;
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            return res.status(400).json({ error: 'Supplier specifications must be a valid JSON object' });
          }
          updateData.supplierSpecs = JSON.stringify(parsed);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid JSON format for supplier specifications' });
        }
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
    });

    // Create item version snapshot before update
    if (req.user) {
      try {
        await VersionService.createItemVersion(id, req.user.userId);
      } catch (error) {
        console.error('Error creating item version:', error);
        // Don't fail item update if version creation fails
      }

      // Create lifecycle event for item update
      try {
        await EventService.createEvent('ITEM_UPDATED', {
          entityType: 'ITEM',
          entityId: id,
          action: 'UPDATE',
          userId: req.user.userId,
          data: {
            projectId: item.projectId,
            changes: updateData,
          },
        });
      } catch (error) {
        console.error('Error creating lifecycle event:', error);
        // Don't fail item update if event creation fails
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: item.projectId,
        userId: req.user?.userId || item.project.createdById,
        action: 'UPDATE_ITEM',
        entityType: 'ITEM',
        entityId: id,
        changes: JSON.stringify(updateData),
      },
    });

    return res.json(updatedItem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

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

    // Create audit log with current user
    await prisma.auditLog.create({
      data: {
        projectId: item.projectId,
        userId: req.user.userId,
        action: 'DELETE_ITEM',
        entityType: 'ITEM',
        entityId: id,
      },
    });

    return res.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

