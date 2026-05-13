import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/review.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listForProduct(req.params.productId, req.query);
  return ApiResponse.ok(res, items, 'Reviews', meta);
});

export const create = asyncHandler(async (req, res) => {
  const review = await svc.createReview(req.user.id, req.body);
  return ApiResponse.created(res, review);
});

export const setStatus = asyncHandler(async (req, res) => {
  const review = await svc.setReviewStatus(req.params.id, req.body.status);
  return ApiResponse.ok(res, review);
});
