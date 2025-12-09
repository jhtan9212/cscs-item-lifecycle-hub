import { Router } from 'express';
import projectsRouter from './projects';
import itemsRouter from './items';
import commentsRouter from './comments';

const router = Router();

router.use('/projects', projectsRouter);
router.use('/items', itemsRouter);
router.use('/comments', commentsRouter);

export default router;

