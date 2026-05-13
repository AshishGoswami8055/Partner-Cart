import mongoose from 'mongoose';
import { VENDOR_STATUS, VENDOR_TIER } from '../constants/index.js';

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: String,
    description: String,
    logo: { url: String, publicId: String },
    banner: { url: String, publicId: String },
    contactEmail: String,
    contactPhone: String,
    website: String,
    address: {
      line1: String,
      line2: String,
      city: { type: String, index: true },
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    status: {
      type: String,
      enum: Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.PENDING,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(VENDOR_TIER),
      default: VENDOR_TIER.BASIC,
    },
    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    stats: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalProducts: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    suspendedReason: String,
  },
  { timestamps: true }
);

vendorSchema.index({ storeName: 'text', tagline: 'text', description: 'text' });

export const Vendor = mongoose.model('Vendor', vendorSchema);
