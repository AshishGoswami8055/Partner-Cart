import { z } from 'zod';
import { objectId } from './common.validation.js';

export const startConversationSchema = {
  body: z.object({ vendorId: objectId, body: z.string().min(1).max(2000).optional() }),
};

export const sendMessageSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ body: z.string().min(1).max(2000) }),
};
