import { z } from 'zod';
import { objectId } from './common.validation.js';

export const addItemSchema = {
  body: z.object({
    productId: objectId,
    quantity: z.number().int().min(1).max(99).default(1),
    variantId: objectId.optional(),
  }),
};

export const updateItemSchema = {
  params: z.object({ productId: objectId }),
  body: z.object({ quantity: z.number().int().min(0).max(99) }),
};
