import { Router } from 'express';
import * as itemController from '../controllers/itemController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// View items - requires VIEW_ITEM permission
router.get(
  '/projects/:projectId/items',
  authenticate,
  checkPermission('VIEW_ITEM'),
  itemController.getItemsByProject
);
router.get(
  '/:id',
  authenticate,
  checkPermission('VIEW_ITEM'),
  itemController.getItem
);

// Create item - requires CREATE_ITEM permission
router.post(
  '/projects/:projectId/items',
  authenticate,
  checkPermission('CREATE_ITEM'),
  itemController.createItem
);

// Update item - requires UPDATE_ITEM permission
router.put(
  '/:id',
  authenticate,
  checkPermission('UPDATE_ITEM'),
  itemController.updateItem
);

// Delete item - requires DELETE_ITEM permission
router.delete(
  '/:id',
  authenticate,
  checkPermission('DELETE_ITEM'),
  itemController.deleteItem
);

export default router;

