import { z } from 'zod';
import { objectId } from './common.validation.js';

const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().default(0),
  attributes: z.record(z.string()).optional(),
});

export const createProductSchema = {
  body: z.object({
    title: z.string().min(2).max(140),
    description: z.string().min(10),
    shortDescription: z.string().max(280).optional(),
    category: objectId,
    tags: z.array(z.string()).default([]),
    images: z
      .array(z.object({ url: z.string().url(), publicId: z.string().optional(), alt: z.string().optional() }))
      .default([]),
    price: z.number().nonnegative(),
    compareAtPrice: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().default(0),
    lowStockThreshold: z.number().int().nonnegative().default(5),
    sku: z.string().optional(),
    variants: z.array(variantSchema).default([]),
    attributes: z.record(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
};

export const updateProductSchema = {
  params: z.object({ id: objectId }),
  body: createProductSchema.body.partial(),
};

export const inventorySchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    stock: z.number().int().min(0).optional(),
    delta: z.number().int().optional(),
  }),
};

export const productListQuerySchema = {
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    vendor: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    inStock: z.enum(['true', 'false']).optional(),
    city: z.string().optional(),
    sort: z.enum(['createdAt', 'price', 'rating', 'salesCount']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
};
