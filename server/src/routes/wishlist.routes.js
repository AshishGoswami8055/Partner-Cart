import { Router } from 'express';
import * as ctrl from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.get);
router.post('/:productId', ctrl.add);
router.delete('/:productId', ctrl.remove);

export default router;
