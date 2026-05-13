import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as svc from '../services/vendor.service.js';
import * as analytics from '../services/analytics.service.js';

export const submitApplication = asyncHandler(async (req, res) => {
  const application = await svc.submitApplication(req.user.id, req.body);
  return ApiResponse.created(res, application, 'Application submitted');
});

export const listApplications = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listApplications(req.query);
  return ApiResponse.ok(res, items, 'Applications', meta);
});

export const reviewApplication = asyncHandler(async (req, res) => {
  const result = await svc.reviewApplication(req.user.id, req.params.id, req.body);
  return ApiResponse.ok(res, result, 'Application reviewed');
});

export const listVendors = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listVendorsPublic(req.query);
  return ApiResponse.ok(res, items, 'Vendors', meta);
});

export const getVendor = asyncHandler(async (req, res) => {
  const vendor = await svc.getVendorBySlug(req.params.slug);
  return ApiResponse.ok(res, vendor);
});

export const getMyStore = asyncHandler(async (req, res) => {
  if (!req.user.vendorId) throw ApiError.forbidden('No vendor profile');
  const vendor = await svc.getOwnStore(req.user.vendorId);
  return ApiResponse.ok(res, vendor);
});

export const updateMyStore = asyncHandler(async (req, res) => {
  const vendor = await svc.updateOwnStore(req.user.vendorId, req.body);
  return ApiResponse.ok(res, vendor, 'Store updated');
});

export const myAnalytics = asyncHandler(async (req, res) => {
  const data = await analytics.vendorOverview(req.user.vendorId);
  return ApiResponse.ok(res, data);
});
