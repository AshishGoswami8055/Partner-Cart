import mongoose from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from '../constants/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: String,
    sku: String,
    variantId: mongoose.Schema.Types.ObjectId,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    cancelledQuantity: { type: Number, default: 0 },
  },
  { _id: true }
);

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    note: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderGroupSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    payout: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: { type: [statusEventSchema], default: [] },
    trackingNumber: String,
    estimatedDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    returnRequest: {
      status: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'completed'], default: 'none' },
      reason: String,
      requestedAt: Date,
    },
  },
  { _id: true, timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: [Number],
    },
    orderGroups: { type: [orderGroupSchema], default: [] },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    payment: {
      method: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.COD },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.UNPAID,
      },
      provider: String,
      providerOrderId: String,
      providerPaymentId: String,
      providerSignature: String,
      paidAt: Date,
    },
    notes: String,
  },
  { timestamps: true }
);

orderSchema.pre('save', async function preSave(next) {
  if (this.isNew && !this.orderNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `PC-${ts}-${rand}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
