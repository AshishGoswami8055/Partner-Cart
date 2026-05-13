import { z } from 'zod';
import { objectId } from './common.validation.js';

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    parent: objectId.optional().nullable(),
    image: z.object({ url: z.string().url(), publicId: z.string().optional() }).optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: objectId }),
  body: createCategorySchema.body.partial(),
};
