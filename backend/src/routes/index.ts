import { Router } from 'express';
import projectsRouter from './projects';
import itemsRouter from './items';
import commentsRouter from './comments';
import authRouter from './auth';
import usersRouter from './users';
import rolesRouter from './roles';
import notificationsRouter from './notifications';
import tasksRouter from './tasks';
import dashboardRouter from './dashboard';
import auditLogsRouter from './auditLogs';
import organizationsRouter from './organizations';

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectsRouter);
router.use('/items', itemsRouter);
router.use('/comments', commentsRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/notifications', notificationsRouter);
router.use('/tasks', tasksRouter);
router.use('/dashboard', dashboardRouter);
router.use('/audit-logs', auditLogsRouter);
router.use('/organizations', organizationsRouter);

export default router;

