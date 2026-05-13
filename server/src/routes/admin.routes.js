import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.get('/stats', ctrl.stats);
router.get('/vendors', ctrl.listVendors);
router.patch('/vendors/:id/status', ctrl.setVendorStatus);
router.get('/products', ctrl.listProducts);
router.get('/audit-logs', ctrl.auditLogs);

export default router;
