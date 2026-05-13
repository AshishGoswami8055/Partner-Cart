import { Router } from 'express';
import * as ctrl from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../constants/index.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', authenticate, requireRole(ROLES.ADMIN), validate(createCategorySchema), ctrl.create);
router.patch('/:id', authenticate, requireRole(ROLES.ADMIN), validate(updateCategorySchema), ctrl.update);
router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), ctrl.remove);

export default router;
