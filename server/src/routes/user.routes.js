import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema } from '../validations/address.validation.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.patch('/me', authenticate, ctrl.updateMe);
router.patch('/me/notification-prefs', authenticate, ctrl.updateNotificationPrefs);

router.get('/me/addresses', authenticate, ctrl.listAddresses);
router.post('/me/addresses', authenticate, validate(addressSchema), ctrl.addAddress);
router.patch('/me/addresses/:aid', authenticate, ctrl.updateAddress);
router.delete('/me/addresses/:aid', authenticate, ctrl.deleteAddress);

router.get('/', authenticate, requireRole(ROLES.ADMIN), ctrl.adminListUsers);
router.get('/:id', authenticate, requireRole(ROLES.ADMIN), ctrl.adminGetUser);
router.patch('/:id/block', authenticate, requireRole(ROLES.ADMIN), ctrl.adminBlockUser);

export default router;
