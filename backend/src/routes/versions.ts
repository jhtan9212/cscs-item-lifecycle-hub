import { Router } from 'express';
import * as versionController from '../controllers/versionController';
import { authenticate } from '../middleware/auth';
import { checkAnyPermission } from '../middleware/permissions';

const router = Router();

// All version routes require authentication and appropriate view permission
router.get(
  '/items/:itemId/versions',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ITEM', 'VIEW_OWN_PROJECTS'),
  versionController.getItemVersions
);

router.get(
  '/items/:itemId/versions/:versionNumber',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ITEM', 'VIEW_OWN_PROJECTS'),
  versionController.getItemVersion
);

router.get(
  '/projects/:projectId/versions',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  versionController.getProjectVersions
);

router.get(
  '/projects/:projectId/versions/:versionNumber',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  versionController.getProjectVersion
);

export default router;

