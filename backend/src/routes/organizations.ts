import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkAdmin } from '../middleware/permissions';
import * as organizationController from '../controllers/organizationController';

const router = Router();

// All organization routes require authentication and admin access
router.use(authenticate);
router.use(checkAdmin);

// Get all organizations
router.get('/', organizationController.getAllOrganizations);

// Get organization by ID
router.get('/:id', organizationController.getOrganization);

// Create organization
router.post('/', organizationController.createOrganization);

// Update organization
router.put('/:id', organizationController.updateOrganization);

// Delete organization
router.delete('/:id', organizationController.deleteOrganization);

// Assign user to organization
router.post('/:id/assign-user', organizationController.assignUserToOrganization);

// Get organization users
router.get('/:id/users', organizationController.getOrganizationUsers);

export default router;

