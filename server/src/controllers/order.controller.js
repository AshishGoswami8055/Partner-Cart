import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as svc from '../services/order.service.js';

export const place = asyncHandler(async (req, res) => {
  const order = await svc.placeOrder(req.user.id, req.body);
  return ApiResponse.created(res, order, 'Order placed');
});

export const prepareRazorpay = asyncHandler(async (req, res) => {
  const session = await svc.prepareRazorpayCheckout(req.user.id, req.body);
  return ApiResponse.ok(res, session, 'Open Razorpay checkout');
});

export const verifyRazorpay = asyncHandler(async (req, res) => {
  const order = await svc.verifyRazorpayPayment(req.user.id, req.params.id, req.body);
  return ApiResponse.ok(res, order, 'Payment confirmed');
});

export const abandonRazorpay = asyncHandler(async (req, res) => {
  const result = await svc.abandonUnpaidRazorpayCheckout(req.user.id, req.params.id);
  return ApiResponse.ok(res, result);
});

export const myOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await svc.myOrders(req.user.id, req.query);
  return ApiResponse.ok(res, items, 'Orders', meta);
});

export const detail = asyncHandler(async (req, res) => {
  const order = await svc.orderById(req.user.id, req.user.role, req.params.id, req.user.vendorId);
  return ApiResponse.ok(res, order);
});

export const vendorList = asyncHandler(async (req, res) => {
  if (!req.user.vendorId) throw ApiError.forbidden();
  const { items, meta } = await svc.vendorOrders(req.user.vendorId, req.query);
  return ApiResponse.ok(res, items, 'Orders', meta);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await svc.updateGroupStatus(
    req.user.vendorId,
    req.params.id,
    req.params.gid,
    req.body
  );
  return ApiResponse.ok(res, order, 'Status updated');
});

export const cancel = asyncHandler(async (req, res) => {
  const order = await svc.cancelOrder(req.user.id, req.params.id, req.body);
  return ApiResponse.ok(res, order, 'Cancelled');
});

export const requestReturn = asyncHandler(async (req, res) => {
  const order = await svc.requestReturn(req.user.id, req.params.id, req.params.gid, req.body.reason);
  return ApiResponse.ok(res, order, 'Return requested');
});
