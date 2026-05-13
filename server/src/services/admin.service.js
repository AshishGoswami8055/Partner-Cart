import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.q) filter.$or = [
    { name: new RegExp(query.q, 'i') },
    { email: new RegExp(query.q, 'i') },
  ];
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const blockUser = async (id, blocked) => {
  const user = await User.findByIdAndUpdate(id, { isBlocked: blocked }, { new: true });
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const listVendors = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.tier) filter.tier = query.tier;
  if (query.q) filter.storeName = new RegExp(query.q, 'i');
  const [items, total] = await Promise.all([
    Vendor.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Vendor.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const listAllProducts = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.q) filter.title = new RegExp(query.q, 'i');
  if (query.vendor) filter.vendor = query.vendor;
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('vendor', 'storeName slug')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};
