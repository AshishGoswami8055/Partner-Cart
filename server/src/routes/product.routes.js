import { Router } from 'express';
import * as ctrl from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  inventorySchema,
  productListQuerySchema,
} from '../validations/product.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.get('/', validate(productListQuerySchema), ctrl.list);
router.get('/me/list', authenticate, requireRole(ROLES.VENDOR), ctrl.myProducts);
router.post(
  '/',
  authenticate,
  requireRole(ROLES.VENDOR),
  validate(createProductSchema),
  ctrl.create
);
router.post('/bulk', authenticate, requireRole(ROLES.VENDOR), ctrl.bulk);
router.patch(
  '/:id',
  authenticate,
  requireRole(ROLES.VENDOR),
  validate(updateProductSchema),
  ctrl.update
);
router.patch(
  '/:id/inventory',
  authenticate,
  requireRole(ROLES.VENDOR),
  validate(inventorySchema),
  ctrl.inventory
);
router.delete('/:id', authenticate, requireRole(ROLES.VENDOR), ctrl.remove);
router.get('/:slug', ctrl.getBySlug);

export default router;
