import { Router } from 'express';
import * as commentController from '../controllers/commentController';

const router = Router();

router.get('/projects/:projectId/comments', commentController.getComments);
router.post('/projects/:projectId/comments', commentController.createComment);

export default router;

