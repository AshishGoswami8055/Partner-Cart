import { Router } from 'express';
import * as ctrl from '../controllers/cart.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addItemSchema, updateItemSchema } from '../validations/cart.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.CUSTOMER, ROLES.VENDOR, ROLES.ADMIN));

router.get('/', ctrl.get);
router.post('/items', validate(addItemSchema), ctrl.addItem);
router.patch('/items/:productId', validate(updateItemSchema), ctrl.updateItem);
router.delete('/items/:productId', ctrl.removeItem);
router.delete('/', ctrl.clear);

export default router;
