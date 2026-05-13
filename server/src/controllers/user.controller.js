import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import * as addressSvc from '../services/address.service.js';
import * as adminSvc from '../services/admin.service.js';

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'location'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
  return ApiResponse.ok(res, user, 'Profile updated');
});

export const updateNotificationPrefs = asyncHandler(async (req, res) => {
  const allowed = ['orderEmails', 'promoEmails', 'chatEmails', 'systemEmails', 'vendorEmails'];
  const update = {};
  for (const k of allowed) {
    if (typeof req.body[k] === 'boolean') update[`notificationPrefs.${k}`] = req.body[k];
  }
  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
  return ApiResponse.ok(res, user, 'Notification preferences saved');
});

export const listAddresses = asyncHandler(async (req, res) => {
  const items = await addressSvc.list(req.user.id);
  return ApiResponse.ok(res, items);
});

export const addAddress = asyncHandler(async (req, res) => {
  const item = await addressSvc.create(req.user.id, req.body);
  return ApiResponse.created(res, item);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const item = await addressSvc.update(req.user.id, req.params.aid, req.body);
  return ApiResponse.ok(res, item);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await addressSvc.remove(req.user.id, req.params.aid);
  return ApiResponse.ok(res, null, 'Removed');
});

export const adminListUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await adminSvc.listUsers(req.query);
  return ApiResponse.ok(res, items, 'Users', meta);
});

export const adminGetUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('vendor');
  if (!user) throw ApiError.notFound('User');
  return ApiResponse.ok(res, user);
});

export const adminBlockUser = asyncHandler(async (req, res) => {
  const user = await adminSvc.blockUser(req.params.id, !!req.body.isBlocked);
  return ApiResponse.ok(res, user);
});
