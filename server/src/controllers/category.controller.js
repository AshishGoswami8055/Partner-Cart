import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/category.service.js';

export const list = asyncHandler(async (_req, res) => {
  const items = await svc.listCategories();
  return ApiResponse.ok(res, items);
});

export const create = asyncHandler(async (req, res) => {
  const category = await svc.createCategory(req.body);
  return ApiResponse.created(res, category);
});

export const update = asyncHandler(async (req, res) => {
  const category = await svc.updateCategory(req.params.id, req.body);
  return ApiResponse.ok(res, category);
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteCategory(req.params.id);
  return ApiResponse.ok(res, null, 'Deleted');
});
