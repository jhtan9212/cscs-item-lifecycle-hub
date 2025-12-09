import { Router } from 'express';
import * as roleController from '../controllers/roleController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// Public endpoint for registration - roles list is not sensitive
router.get('/', roleController.getAllRoles);
// Protected endpoints
router.get('/:id', authenticate, roleController.getRole);
router.get('/permissions/all', authenticate, roleController.getAllPermissions);
router.put(
  '/:id/permissions',
  authenticate,
  checkPermission('MANAGE_PERMISSIONS'),
  roleController.updateRolePermissions
);

export default router;

