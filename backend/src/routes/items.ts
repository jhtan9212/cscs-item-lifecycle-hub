import { Router } from 'express';
import * as itemController from '../controllers/itemController';

const router = Router();

router.get('/projects/:projectId/items', itemController.getItemsByProject);
router.get('/:id', itemController.getItem);
router.post('/projects/:projectId/items', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;

