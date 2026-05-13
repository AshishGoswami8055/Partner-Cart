import { z } from 'zod';
import { objectId } from './common.validation.js';

export const applicationSchema = {
  body: z.object({
    businessName: z.string().min(2).max(120),
    businessType: z.string().optional(),
    description: z.string().max(1000).optional(),
    website: z.string().url().optional().or(z.literal('')),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
  }),
};

export const reviewApplicationSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    decision: z.enum(['approve', 'reject']),
    note: z.string().optional(),
    commissionRate: z.number().min(0).max(100).optional(),
    tier: z.enum(['basic', 'premium', 'verified']).optional(),
  }),
};

export const updateStoreSchema = {
  body: z.object({
    storeName: z.string().min(2).max(120).optional(),
    tagline: z.string().max(140).optional(),
    description: z.string().max(2000).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    logo: z.object({ url: z.string().url(), publicId: z.string().optional() }).optional(),
    banner: z.object({ url: z.string().url(), publicId: z.string().optional() }).optional(),
  }),
};
