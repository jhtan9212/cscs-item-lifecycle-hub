import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { checkPermission, checkAnyPermission } from '../middleware/permissions';

const router = Router();

// View routes - require VIEW_PROJECT, VIEW_ALL_PROJECTS, or VIEW_OWN_PROJECTS permission
// Users with VIEW_OWN_PROJECTS will see only their assigned projects (filtered in controller)
router.get(
  '/',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  projectController.getAllProjects
);
// My assigned projects - allow VIEW_PROJECT, VIEW_ALL_PROJECTS, or VIEW_OWN_PROJECTS
router.get(
  '/my-assigned',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  projectController.getMyAssignedProjects
);
// Project detail - allow VIEW_PROJECT, VIEW_ALL_PROJECTS, or VIEW_OWN_PROJECTS
router.get(
  '/:id',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  projectController.getProject
);
router.get(
  '/:id/workflow',
  authenticate,
  checkAnyPermission('VIEW_PROJECT', 'VIEW_ALL_PROJECTS', 'VIEW_OWN_PROJECTS'),
  projectController.getWorkflowStatus
);

// Protected routes
router.post(
  '/',
  authenticate,
  checkPermission('CREATE_PROJECT'),
  projectController.createProject
);
router.put(
  '/:id',
  authenticate,
  checkPermission('UPDATE_PROJECT'),
  projectController.updateProject
);
router.delete(
  '/:id',
  authenticate,
  checkPermission('DELETE_PROJECT'),
  projectController.deleteProject
);
router.post(
  '/:id/advance',
  authenticate,
  checkPermission('ADVANCE_WORKFLOW'),
  projectController.advanceWorkflow
);
router.post(
  '/:id/back',
  authenticate,
  checkPermission('MOVE_BACK_WORKFLOW'),
  projectController.moveBackWorkflow
);

export default router;

