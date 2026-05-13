import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get('/customer', requireRole(ROLES.CUSTOMER, ROLES.VENDOR, ROLES.ADMIN), ctrl.customer);
router.get('/vendor', requireRole(ROLES.VENDOR), ctrl.vendor);
router.get('/admin', requireRole(ROLES.ADMIN), ctrl.admin);

export default router;
