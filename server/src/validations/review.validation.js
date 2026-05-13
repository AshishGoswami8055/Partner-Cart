import { z } from 'zod';
import { objectId } from './common.validation.js';

export const createReviewSchema = {
  body: z.object({
    productId: objectId,
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    body: z.string().max(2000).optional(),
    orderId: objectId.optional(),
  }),
};

export const updateReviewStatusSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ status: z.enum(['published', 'hidden', 'flagged']) }),
};
