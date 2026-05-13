import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as svc from '../services/product.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listProducts(req.query);
  return ApiResponse.ok(res, items, 'Products', meta);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await svc.getProductBySlug(req.params.slug);
  return ApiResponse.ok(res, product);
});

export const create = asyncHandler(async (req, res) => {
  if (!req.user.vendorId) throw ApiError.forbidden('No vendor profile');
  const product = await svc.createProduct(req.user.vendorId, req.body);
  return ApiResponse.created(res, product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await svc.updateProduct(req.user.vendorId, req.params.id, req.body);
  return ApiResponse.ok(res, product);
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteProduct(req.user.vendorId, req.params.id);
  return ApiResponse.ok(res, null, 'Deleted');
});

export const inventory = asyncHandler(async (req, res) => {
  const product = await svc.adjustInventory(req.user.vendorId, req.params.id, req.body);
  return ApiResponse.ok(res, product);
});

export const bulk = asyncHandler(async (req, res) => {
  const created = await svc.bulkCreate(req.user.vendorId, req.body.products);
  return ApiResponse.created(res, created);
});

export const myProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.listVendorProducts(req.user.vendorId, req.query);
  return ApiResponse.ok(res, items, 'My products', meta);
});
