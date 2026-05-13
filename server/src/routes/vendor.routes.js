import { Router } from 'express';
import * as ctrl from '../controllers/vendor.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { applicationSchema, reviewApplicationSchema, updateStoreSchema } from '../validations/vendor.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.post(
  '/applications',
  authenticate,
  validate(applicationSchema),
  ctrl.submitApplication
);
router.get('/applications', authenticate, requireRole(ROLES.ADMIN), ctrl.listApplications);
router.patch(
  '/applications/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(reviewApplicationSchema),
  ctrl.reviewApplication
);

router.get('/me/store', authenticate, requireRole(ROLES.VENDOR), ctrl.getMyStore);
router.patch(
  '/me/store',
  authenticate,
  requireRole(ROLES.VENDOR),
  validate(updateStoreSchema),
  ctrl.updateMyStore
);
router.get('/me/analytics', authenticate, requireRole(ROLES.VENDOR), ctrl.myAnalytics);

router.get('/', ctrl.listVendors);
router.get('/:slug', ctrl.getVendor);

export default router;
