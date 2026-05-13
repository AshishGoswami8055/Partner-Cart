import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/analytics.service.js';

export const customer = asyncHandler(async (req, res) => {
  const data = await svc.customerOverview(req.user.id);
  return ApiResponse.ok(res, data);
});

export const vendor = asyncHandler(async (req, res) => {
  const data = await svc.vendorOverview(req.user.vendorId);
  return ApiResponse.ok(res, data);
});

export const admin = asyncHandler(async (_req, res) => {
  const data = await svc.adminOverview();
  return ApiResponse.ok(res, data);
});
