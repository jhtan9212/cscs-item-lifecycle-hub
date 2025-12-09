import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // All notification routes require authentication

router.get('/', notificationController.getUserNotifications);
router.get('/unread/count', notificationController.getUnreadCount);
router.post('/:id/read', notificationController.markAsRead);
router.post('/read/all', notificationController.markAllAsRead);

export default router;

