import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { checkAdmin, checkPermission } from '../middleware/permissions';

const router = Router();

router.get(
  '/',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.getAllUsers
);
router.get(
  '/:id',
  authenticate,
  userController.getUser
);
router.put(
  '/:id',
  authenticate,
  checkPermission('MANAGE_USERS'),
  userController.updateUser
);
router.post(
  '/:id/change-password',
  authenticate,
  userController.changePassword
);

export default router;

