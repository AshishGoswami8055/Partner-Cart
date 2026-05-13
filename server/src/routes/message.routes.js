import { Router } from 'express';
import * as ctrl from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { startConversationSchema, sendMessageSchema } from '../validations/message.validation.js';

const router = Router();

router.use(authenticate);

router.get('/conversations', ctrl.listConversations);
router.post('/conversations', validate(startConversationSchema), ctrl.start);
router.get('/conversations/:id', ctrl.messages);
router.post('/conversations/:id/messages', validate(sendMessageSchema), ctrl.send);

export default router;
