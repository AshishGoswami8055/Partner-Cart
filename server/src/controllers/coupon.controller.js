import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/coupon.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listCoupons(req.query);
  return ApiResponse.ok(res, items, 'Coupons', meta);
});

export const create = asyncHandler(async (req, res) => {
  const coupon = await svc.createCoupon(req.body);
  return ApiResponse.created(res, coupon);
});

export const update = asyncHandler(async (req, res) => {
  const coupon = await svc.updateCoupon(req.params.id, req.body);
  return ApiResponse.ok(res, coupon);
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteCoupon(req.params.id);
  return ApiResponse.ok(res, null, 'Deleted');
});

export const apply = asyncHandler(async (req, res) => {
  const result = await svc.applyCoupon(req.user.id, req.body.code);
  return ApiResponse.ok(res, result, 'Coupon applied');
});
