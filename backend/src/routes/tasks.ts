import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // All task routes require authentication

router.get('/', taskController.getUserTasks);
router.get('/user', taskController.getUserTasks);
router.get('/project/:projectId', taskController.getProjectTasks);
router.post('/', taskController.createTask);
router.post('/:id/complete', taskController.completeTask);

export default router;

