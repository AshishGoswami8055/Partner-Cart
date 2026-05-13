import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const data = await svc.list(req.user.id, req.query);
  return ApiResponse.ok(res, data.items, 'Notifications', { ...data.meta, unread: data.unread });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await svc.markRead(req.user.id, req.params.id);
  return ApiResponse.ok(res, item);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await svc.markAllRead(req.user.id);
  return ApiResponse.ok(res, null, 'All read');
});
