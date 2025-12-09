import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// View comments - requires VIEW_PROJECT permission (comments are part of project)
router.get(
  '/projects/:projectId/comments',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  commentController.getComments
);

// Create comment - requires VIEW_PROJECT permission (anyone viewing can comment)
router.post(
  '/projects/:projectId/comments',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  commentController.createComment
);

export default router;

