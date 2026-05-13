import { z } from 'zod';
import { objectId } from './common.validation.js';

export const createCouponSchema = {
  body: z.object({
    code: z.string().min(3).max(30),
    description: z.string().optional(),
    type: z.enum(['percent', 'fixed', 'free_shipping']).default('percent'),
    value: z.number().nonnegative().default(0),
    maxDiscount: z.number().nonnegative().optional(),
    minOrder: z.number().nonnegative().default(0),
    scope: z.enum(['platform', 'vendor']).default('platform'),
    vendor: objectId.optional(),
    products: z.array(objectId).optional(),
    categories: z.array(objectId).optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    usageLimit: z.number().int().nonnegative().default(0),
    perUserLimit: z.number().int().nonnegative().default(1),
    isActive: z.boolean().default(true),
  }),
};

export const applyCouponSchema = {
  body: z.object({ code: z.string().min(2) }),
};
