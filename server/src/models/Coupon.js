import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: {
      type: String,
      enum: ['percent', 'fixed', 'free_shipping'],
      default: 'percent',
    },
    value: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number },
    minOrder: { type: Number, default: 0 },
    scope: { type: String, enum: ['platform', 'vendor'], default: 'platform' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    startsAt: Date,
    endsAt: { type: Date, index: true },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
