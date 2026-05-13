import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as adminSvc from '../services/admin.service.js';
import * as analytics from '../services/analytics.service.js';
import * as vendorSvc from '../services/vendor.service.js';
import { AuditLog } from '../models/AuditLog.js';

export const stats = asyncHandler(async (_req, res) => {
  const data = await analytics.adminOverview();
  return ApiResponse.ok(res, data);
});

export const listVendors = asyncHandler(async (req, res) => {
  const { items, meta } = await adminSvc.listVendors(req.query);
  return ApiResponse.ok(res, items, 'Vendors', meta);
});

export const setVendorStatus = asyncHandler(async (req, res) => {
  const vendor = await vendorSvc.setVendorStatus(req.params.id, req.body);
  await AuditLog.create({
    actor: req.user.id,
    actorRole: req.user.role,
    action: `vendor.${req.body.status}`,
    target: { type: 'Vendor', id: vendor._id },
    metadata: req.body,
  });
  return ApiResponse.ok(res, vendor);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await adminSvc.listAllProducts(req.query);
  return ApiResponse.ok(res, items, 'Products', meta);
});

export const auditLogs = asyncHandler(async (_req, res) => {
  const items = await AuditLog.find()
    .populate('actor', 'name email')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return ApiResponse.ok(res, items);
});
