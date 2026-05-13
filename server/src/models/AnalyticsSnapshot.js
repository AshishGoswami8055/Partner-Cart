import mongoose from 'mongoose';

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['platform', 'vendor'], required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
    date: { type: Date, required: true, index: true },
    metrics: {
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      newVendors: { type: Number, default: 0 },
      productsSold: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ scope: 1, vendor: 1, date: 1 }, { unique: true });

export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
