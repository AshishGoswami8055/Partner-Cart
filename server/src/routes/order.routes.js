import { Router } from 'express';
import * as ctrl from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  placeOrderSchema,
  razorpayPrepareSchema,
  verifyPaymentSchema,
  abandonPaymentSchema,
  updateGroupStatusSchema,
  cancelOrderSchema,
  returnRequestSchema,
} from '../validations/order.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/checkout/razorpay',
  requireRole(ROLES.CUSTOMER),
  validate(razorpayPrepareSchema),
  ctrl.prepareRazorpay
);
router.post(
  '/:id/payment/verify',
  requireRole(ROLES.CUSTOMER),
  validate(verifyPaymentSchema),
  ctrl.verifyRazorpay
);
router.post(
  '/:id/payment/abandon',
  requireRole(ROLES.CUSTOMER),
  validate(abandonPaymentSchema),
  ctrl.abandonRazorpay
);

router.post('/', requireRole(ROLES.CUSTOMER), validate(placeOrderSchema), ctrl.place);
router.get('/me', requireRole(ROLES.CUSTOMER), ctrl.myOrders);
router.get('/vendor', requireRole(ROLES.VENDOR), ctrl.vendorList);
router.get('/:id', ctrl.detail);
router.patch(
  '/:id/groups/:gid/status',
  requireRole(ROLES.VENDOR),
  validate(updateGroupStatusSchema),
  ctrl.updateStatus
);
router.post('/:id/cancel', requireRole(ROLES.CUSTOMER), validate(cancelOrderSchema), ctrl.cancel);
router.post(
  '/:id/groups/:gid/return',
  requireRole(ROLES.CUSTOMER),
  validate(returnRequestSchema),
  ctrl.requestReturn
);

export default router;
