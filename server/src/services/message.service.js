import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Vendor } from '../models/Vendor.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, NOTIFICATION_TYPE } from '../constants/index.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { emitToConversation, emitToUser, emitToVendor } from '../sockets/emit.js';

export const listConversations = async (user) => {
  const filter =
    user.role === ROLES.VENDOR
      ? { vendor: user.vendorId }
      : { customer: user.id };
  const items = await Conversation.find(filter)
    .populate('customer', 'name avatar')
    .populate('vendor', 'storeName slug logo')
    .sort({ updatedAt: -1 })
    .lean();
  return items;
};

export const startConversation = async (user, { vendorId, body }) => {
  if (user.role !== ROLES.CUSTOMER) throw ApiError.forbidden();
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw ApiError.notFound('Vendor');
  let conversation = await Conversation.findOne({ customer: user.id, vendor: vendor._id });
  if (!conversation) {
    conversation = await Conversation.create({ customer: user.id, vendor: vendor._id });
  }
  if (body) await sendMessage(user, conversation._id, body);
  return conversation;
};

export const getMessages = async (user, conversationId, query) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw ApiError.notFound('Conversation');
  const isCustomer = user.role === ROLES.CUSTOMER && String(conversation.customer) === user.id;
  const isVendor = user.role === ROLES.VENDOR && String(conversation.vendor) === user.vendorId;
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isCustomer && !isVendor && !isAdmin) throw ApiError.forbidden();

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 30 });
  const items = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Message.countDocuments({ conversation: conversation._id });

  if (isCustomer) {
    conversation.unread.customer = 0;
    await conversation.save();
  } else if (isVendor) {
    conversation.unread.vendor = 0;
    await conversation.save();
  }

  return { conversation, items: items.reverse(), meta: buildMeta({ page, limit }, total) };
};

export const sendMessage = async (user, conversationId, body) => {
  const conversation = await Conversation.findById(conversationId).populate('vendor', 'user');
  if (!conversation) throw ApiError.notFound('Conversation');
  const isCustomer = user.role === ROLES.CUSTOMER && String(conversation.customer) === user.id;
  const isVendor = user.role === ROLES.VENDOR && String(conversation.vendor._id) === user.vendorId;
  if (!isCustomer && !isVendor) throw ApiError.forbidden();

  const message = await Message.create({
    conversation: conversation._id,
    sender: user.id,
    body,
  });

  conversation.lastMessage = { body, sender: user.id, sentAt: new Date() };
  if (isCustomer) conversation.unread.vendor += 1;
  if (isVendor) conversation.unread.customer += 1;
  await conversation.save();

  emitToConversation(String(conversation._id), 'chat:message', message);

  // Real-time chat is push-only — we don't email on every message to avoid
  // spamming inboxes. The bell still lights up via socket.io.
  const recipient = isCustomer ? conversation.vendor.user : conversation.customer;
  if (isCustomer) emitToVendor(String(conversation.vendor._id), 'chat:message', message);
  else emitToUser(String(conversation.customer), 'chat:message', message);

  await Notification.create({
    user: recipient,
    type: NOTIFICATION_TYPE.CHAT,
    title: 'New message',
    body: body.slice(0, 80),
    link: isCustomer ? '/vendor/messages' : '/app/messages',
    data: { conversationId: conversation._id },
  });

  return message;
};
