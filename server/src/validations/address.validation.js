import { z } from 'zod';
import { objectId } from './common.validation.js';

export const addressSchema = {
  body: z.object({
    label: z.string().optional(),
    fullName: z.string().min(2),
    phone: z.string().min(5),
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().optional(),
    coordinates: z.array(z.number()).length(2).optional(),
    isDefault: z.boolean().optional(),
  }),
};

export const addressIdParam = { params: z.object({ aid: objectId }) };
