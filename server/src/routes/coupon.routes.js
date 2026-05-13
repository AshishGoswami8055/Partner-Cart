import { Router } from 'express';
import * as ctrl from '../controllers/coupon.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCouponSchema, applyCouponSchema } from '../validations/coupon.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/', ctrl.list);
router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.VENDOR),
  validate(createCouponSchema),
  ctrl.create
);
router.patch('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.VENDOR), ctrl.update);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.VENDOR), ctrl.remove);
router.post('/apply', authenticate, validate(applyCouponSchema), ctrl.apply);

export default router;
