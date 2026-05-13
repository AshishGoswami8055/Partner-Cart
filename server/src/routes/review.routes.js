import { Router } from 'express';
import * as ctrl from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema, updateReviewStatusSchema } from '../validations/review.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/product/:productId', ctrl.list);
router.post('/', authenticate, validate(createReviewSchema), ctrl.create);
router.patch(
  '/:id/status',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate(updateReviewStatusSchema),
  ctrl.setStatus
);

export default router;
