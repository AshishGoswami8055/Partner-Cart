import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as svc from '../services/message.service.js';

export const listConversations = asyncHandler(async (req, res) => {
  const items = await svc.listConversations(req.user);
  return ApiResponse.ok(res, items);
});

export const start = asyncHandler(async (req, res) => {
  const conversation = await svc.startConversation(req.user, req.body);
  return ApiResponse.created(res, conversation);
});

export const messages = asyncHandler(async (req, res) => {
  const data = await svc.getMessages(req.user, req.params.id, req.query);
  return ApiResponse.ok(res, data);
});

export const send = asyncHandler(async (req, res) => {
  const message = await svc.sendMessage(req.user, req.params.id, req.body.body);
  return ApiResponse.created(res, message);
});
