import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/wishlist.service.js';

export const get = asyncHandler(async (req, res) => {
  const wishlist = await svc.get(req.user.id);
  return ApiResponse.ok(res, wishlist);
});

export const add = asyncHandler(async (req, res) => {
  const wishlist = await svc.add(req.user.id, req.params.productId);
  return ApiResponse.ok(res, wishlist, 'Added to wishlist');
});

export const remove = asyncHandler(async (req, res) => {
  const wishlist = await svc.remove(req.user.id, req.params.productId);
  return ApiResponse.ok(res, wishlist, 'Removed');
});
