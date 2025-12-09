import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();

// All audit log routes require authentication and MANAGE_USERS or VIEW_AUDIT_LOGS permission
// Typically only Admin has VIEW_AUDIT_LOGS permission
router.use(authenticate);
router.use(checkPermission('VIEW_AUDIT_LOGS'));

// Get audit logs with filtering
router.get('/', auditLogController.getAuditLogs);

// Get filter options
router.get('/filters', auditLogController.getAuditLogFilters);

// Get single audit log
router.get('/:id', auditLogController.getAuditLog);

export default router;

