import { Coupon } from '../models/Coupon.js';
import { Cart } from '../models/Cart.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export const listCoupons = async (query) => {
  const filter = {};
  if (query.scope) filter.scope = query.scope;
  if (query.vendor) filter.vendor = query.vendor;
  if (query.active === 'true') {
    filter.isActive = true;
    filter.$or = [{ endsAt: null }, { endsAt: { $gt: new Date() } }];
  }
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const createCoupon = async (data) => {
  data.code = String(data.code).toUpperCase();
  try {
    return await Coupon.create(data);
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('Coupon code already exists');
    throw err;
  }
};

export const updateCoupon = async (id, data) => {
  if (data.code) data.code = String(data.code).toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon');
  return coupon;
};

export const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw ApiError.notFound('Coupon');
};

const computeDiscount = (subtotal, coupon) => {
  if (subtotal < coupon.minOrder) return 0;
  if (coupon.type === 'percent') {
    let d = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount) d = Math.min(d, coupon.maxDiscount);
    return d;
  }
  if (coupon.type === 'fixed') {
    return Math.min(subtotal, coupon.value);
  }
  return 0;
};

export const applyCoupon = async (userId, code) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || !cart.items.length) throw ApiError.badRequest('Cart is empty');
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
  if (!coupon) throw ApiError.notFound('Coupon');
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw ApiError.badRequest('Coupon not active yet');
  if (coupon.endsAt && coupon.endsAt < now) throw ApiError.badRequest('Coupon expired');

  const subtotal = cart.items.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0);
  const discount = computeDiscount(subtotal, coupon);
  if (discount === 0) throw ApiError.badRequest(`Minimum order ${coupon.minOrder} required`);

  cart.couponCode = coupon.code;
  await cart.save();
  return { coupon, subtotal, discount };
};
