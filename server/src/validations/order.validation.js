import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_METHOD } from '../constants/index.js';
import { objectId } from './common.validation.js';

export const placeOrderSchema = {
  body: z.object({
    addressId: objectId.optional(),
    shippingAddress: z
      .object({
        fullName: z.string(),
        phone: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().optional(),
        coordinates: z.array(z.number()).optional(),
      })
      .optional(),
    paymentMethod: z.literal(PAYMENT_METHOD.COD).default(PAYMENT_METHOD.COD),
    couponCode: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
};

export const updateGroupStatusSchema = {
  params: z.object({ id: objectId, gid: objectId }),
  body: z.object({
    status: z.enum(Object.values(ORDER_STATUS)),
    note: z.string().optional(),
    trackingNumber: z.string().optional(),
  }),
};

export const cancelOrderSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    groupId: objectId.optional(),
    reason: z.string().max(280).optional(),
  }),
};

export const razorpayPrepareSchema = {
  body: z.object({
    addressId: objectId.optional(),
    shippingAddress: z
      .object({
        fullName: z.string(),
        phone: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().optional(),
        coordinates: z.array(z.number()).optional(),
      })
      .optional(),
    notes: z.string().max(500).optional(),
  }),
};

export const verifyPaymentSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
};

export const abandonPaymentSchema = {
  params: z.object({ id: objectId }),
};

export const returnRequestSchema = {
  params: z.object({ id: objectId, gid: objectId }),
  body: z.object({ reason: z.string().min(3).max(500) }),
};
