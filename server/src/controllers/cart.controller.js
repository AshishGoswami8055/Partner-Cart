import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/cart.service.js';

export const get = asyncHandler(async (req, res) => {
  const cart = await svc.getOrCreateCart(req.user.id);
  return ApiResponse.ok(res, cart);
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await svc.addItem(req.user.id, req.body);
  return ApiResponse.ok(res, cart, 'Added to cart');
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await svc.updateItem(req.user.id, req.params.productId, req.body.quantity);
  return ApiResponse.ok(res, cart);
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await svc.removeItem(req.user.id, req.params.productId);
  return ApiResponse.ok(res, cart);
});

export const clear = asyncHandler(async (req, res) => {
  const cart = await svc.clearCart(req.user.id);
  return ApiResponse.ok(res, cart);
});
