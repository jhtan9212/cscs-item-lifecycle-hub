import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// Get all users - requires MANAGE_USERS permission
router.get(
  '/',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.getAllUsers
);

// Get single user - requires MANAGE_USERS permission
router.get(
  '/:id',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.getUser
);

// Create new user - requires MANAGE_USERS permission
router.post(
  '/',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.createUser
);

// Update user - requires MANAGE_USERS permission
router.put(
  '/:id',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.updateUser
);

// Change user password - requires MANAGE_USERS permission
router.post(
  '/:id/change-password',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.changePassword
);

// Deactivate user - requires MANAGE_USERS permission
router.post(
  '/:id/deactivate',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.deactivateUser
);

// Activate user - requires MANAGE_USERS permission
router.post(
  '/:id/activate',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.activateUser
);

export default router;

