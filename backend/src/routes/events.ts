import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// All event routes require authentication and VIEW_PROJECT permission
router.get(
  '/',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  eventController.getEvents
);

router.get(
  '/filters',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  eventController.getEventFilters
);

router.get(
  '/:id',
  authenticate,
  checkPermission('VIEW_PROJECT'),
  eventController.getEvent
);

export default router;

