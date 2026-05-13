import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';

const daysBack = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const adminOverview = async () => {
  const [users, vendors, products, orders, revenueAgg, pendingApps, vendorGrowth, dailyRevenue] =
    await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      Product.countDocuments({ isDeleted: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': { $in: ['paid', 'unpaid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      mongoose.model('VendorApplication').countDocuments({ status: 'pending' }),
      Vendor.aggregate([
        { $match: { createdAt: { $gte: daysBack(30) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: daysBack(30) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  return {
    counts: {
      users,
      vendors,
      products,
      orders,
      revenue: revenueAgg[0]?.total || 0,
      pendingApplications: pendingApps,
    },
    vendorGrowth,
    dailyRevenue,
  };
};

export const vendorOverview = async (vendorId) => {
  const vId = new mongoose.Types.ObjectId(vendorId);
  const [revAgg, daily, topProducts, statusCounts, lowStock] = await Promise.all([
    Order.aggregate([
      { $unwind: '$orderGroups' },
      { $match: { 'orderGroups.vendor': vId } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$orderGroups.payout' },
          orders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      { $unwind: '$orderGroups' },
      { $match: { 'orderGroups.vendor': vId, createdAt: { $gte: daysBack(30) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$orderGroups.payout' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$orderGroups' },
      { $match: { 'orderGroups.vendor': vId } },
      { $unwind: '$orderGroups.items' },
      {
        $group: {
          _id: '$orderGroups.items.product',
          title: { $first: '$orderGroups.items.title' },
          sold: { $sum: '$orderGroups.items.quantity' },
          revenue: { $sum: '$orderGroups.items.subtotal' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $unwind: '$orderGroups' },
      { $match: { 'orderGroups.vendor': vId } },
      { $group: { _id: '$orderGroups.status', count: { $sum: 1 } } },
    ]),
    Product.find({
      vendor: vId,
      isDeleted: false,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
      .select('title stock lowStockThreshold')
      .limit(10)
      .lean(),
  ]);

  return {
    counts: {
      revenue: revAgg[0]?.revenue || 0,
      orders: revAgg[0]?.orders || 0,
    },
    daily,
    topProducts,
    statusCounts,
    lowStock,
  };
};

export const customerOverview = async (userId) => {
  const id = new mongoose.Types.ObjectId(userId);
  const [counts, recent] = await Promise.all([
    Order.aggregate([
      { $match: { customer: id } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          spend: { $sum: '$total' },
        },
      },
    ]),
    Order.find({ customer: id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return {
    counts: {
      orders: counts[0]?.orders || 0,
      spend: counts[0]?.spend || 0,
    },
    recent,
  };
};
