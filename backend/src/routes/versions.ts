import { Router } from 'express';
import * as versionController from '../controllers/versionController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// All version routes require authentication and VIEW_PROJECT permission
router.get(
  '/items/:itemId/versions',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  versionController.getItemVersions
);

router.get(
  '/items/:itemId/versions/:versionNumber',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  versionController.getItemVersion
);

router.get(
  '/projects/:projectId/versions',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  versionController.getProjectVersions
);

router.get(
  '/projects/:projectId/versions/:versionNumber',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  versionController.getProjectVersion
);

export default router;

