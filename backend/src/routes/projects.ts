import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/advance', projectController.advanceWorkflow);
router.post('/:id/back', projectController.moveBackWorkflow);
router.get('/:id/workflow', projectController.getWorkflowStatus);

export default router;

