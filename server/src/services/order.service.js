import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Vendor } from '../models/Vendor.js';
import { Address } from '../models/Address.js';
import { ApiError } from '../utils/ApiError.js';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ORDER_STATUS_FLOW,
  NOTIFICATION_TYPE,
  VENDOR_STATUS,
} from '../constants/index.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { emitToUser, emitToVendor } from '../sockets/emit.js';
import { createAndDeliver } from './notification.service.js';

const SHIPPING_PER_VENDOR = 39;

const groupByVendor = (items) => {
  const map = new Map();
  for (const item of items) {
    const key = String(item.vendor._id || item.vendor);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
};

async function assembleCheckoutDraft(userId, input) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product items.vendor');
  if (!cart || !cart.items.length) throw ApiError.badRequest('Cart is empty');

  let address = input.shippingAddress;
  if (!address && input.addressId) {
    const saved = await Address.findOne({ _id: input.addressId, user: userId }).lean();
    if (!saved) throw ApiError.notFound('Address');
    address = {
      fullName: saved.fullName,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
      country: saved.country,
      coordinates: saved.coordinates,
    };
  }
  if (!address) throw ApiError.badRequest('Shipping address required');

  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.isDeleted || !product.isPublished) {
      throw ApiError.badRequest(`Product unavailable: ${item.titleSnapshot}`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${product.title}`);
    }
    const vid = item.vendor?._id || item.vendor || product.vendor;
    const vendorDoc =
      item.vendor && item.vendor.status
        ? item.vendor
        : await Vendor.findById(vid).select('status storeName').lean();
    if (!vendorDoc || vendorDoc.status !== VENDOR_STATUS.VERIFIED) {
      throw ApiError.badRequest(`Store unavailable for "${product.title}". Try removing it from your cart.`);
    }
  }

  const grouped = groupByVendor(cart.items);
  const orderGroups = [];
  let subtotal = 0;
  let shippingFee = 0;

  for (const [vendorId, items] of grouped) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw ApiError.notFound('Vendor');

    const groupItems = items.map((i) => ({
      product: i.product._id,
      title: i.product.title,
      image: i.product.images?.[0]?.url,
      sku: i.product.sku,
      variantId: i.variantId,
      price: i.priceSnapshot,
      quantity: i.quantity,
      subtotal: i.priceSnapshot * i.quantity,
    }));

    const groupSubtotal = groupItems.reduce((s, x) => s + x.subtotal, 0);
    const groupShipping = SHIPPING_PER_VENDOR;
    const commission = Math.round((groupSubtotal * vendor.commissionRate) / 100);
    const total = groupSubtotal + groupShipping;

    orderGroups.push({
      vendor: vendor._id,
      items: groupItems,
      subtotal: groupSubtotal,
      shippingFee: groupShipping,
      discount: 0,
      commission,
      payout: groupSubtotal - commission,
      total,
      status: ORDER_STATUS.PENDING,
      statusHistory: [{ status: ORDER_STATUS.PENDING, at: new Date() }],
    });

    subtotal += groupSubtotal;
    shippingFee += groupShipping;
  }

  const total = subtotal + shippingFee;
  return { cart, address, orderGroups, subtotal, shippingFee, total };
}

async function decrementStockFromSnapshots(orderDoc) {
  for (const group of orderDoc.orderGroups) {
    for (const line of group.items) {
      await Product.updateOne(
        { _id: line.product },
        { $inc: { stock: -line.quantity, salesCount: line.quantity } }
      );
    }
  }
}

async function emitNewOrderSideEffects(order, customerId, cartDoc) {
  cartDoc.items = [];
  cartDoc.couponCode = undefined;
  await cartDoc.save();

  for (const group of order.orderGroups) {
    const vendorOwner = (await Vendor.findById(group.vendor).select('user').lean())?.user;
    await createAndDeliver({
      user: vendorOwner,
      type: NOTIFICATION_TYPE.ORDER,
      title: 'New order received',
      body: `Order ${order.orderNumber} — ${group.items.length} item(s)`,
      link: `/vendor/orders/${order._id}`,
      data: { orderId: order._id, groupId: group._id },
    });
    emitToVendor(String(group.vendor), 'order:new', {
      orderId: order._id,
      groupId: group._id,
    });
  }

  await createAndDeliver({
    user: customerId,
    type: NOTIFICATION_TYPE.ORDER,
    title: 'Order placed',
    body: `Your order ${order.orderNumber} has been placed.`,
    link: `/app/orders/${order._id}`,
    data: { orderId: order._id },
  });
  emitToUser(String(customerId), 'order:status', { orderId: order._id, status: 'pending' });
}

function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  try {
    return (
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'))
    );
  } catch {
    return false;
  }
}

async function validateStockAgainstOrderSnapshots(orderMongoDoc) {
  for (const g of orderMongoDoc.orderGroups) {
    for (const line of g.items) {
      const product = await Product.findById(line.product).select('stock title isPublished isDeleted');
      if (!product || product.isDeleted || !product.isPublished) {
        throw ApiError.badRequest(`Product no longer available: ${line.title}`);
      }
      if (product.stock < line.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${line.title}"`);
      }
    }
  }
}

export const placeOrder = async (userId, input) => {
  const draft = await assembleCheckoutDraft(userId, input);

  const order = await Order.create({
    customer: userId,
    shippingAddress: draft.address,
    orderGroups: draft.orderGroups,
    subtotal: draft.subtotal,
    shippingFee: draft.shippingFee,
    total: draft.total,
    payment: {
      method: PAYMENT_METHOD.COD,
      status: PAYMENT_STATUS.UNPAID,
    },
    notes: input.notes,
  });

  await decrementStockFromSnapshots(order);
  await emitNewOrderSideEffects(order, userId, draft.cart);

  return Order.findById(order._id);
};

/** Creates Razorpay order + pending PartnerCart order (cart untouched until verify). */
export const prepareRazorpayCheckout = async (userId, input) => {
  if (!env.razorpay?.keyId || !env.razorpay?.keySecret) {
    throw ApiError.badRequest(
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server .env file.'
    );
  }

  const draft = await assembleCheckoutDraft(userId, input);
  const amountPaise = Math.max(100, Math.round(draft.total * 100));

  const partnerOrder = await Order.create({
    customer: userId,
    shippingAddress: draft.address,
    orderGroups: draft.orderGroups,
    subtotal: draft.subtotal,
    shippingFee: draft.shippingFee,
    total: draft.total,
    currency: 'INR',
    payment: {
      method: PAYMENT_METHOD.RAZORPAY,
      status: PAYMENT_STATUS.UNPAID,
      provider: 'razorpay',
    },
    notes: input.notes,
  });

  const razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });

  let rzOrder;
  try {
    rzOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(partnerOrder.orderNumber).slice(0, 40),
      notes: {
        partnerOrderId: String(partnerOrder._id),
      },
    });
  } catch (err) {
    await Order.deleteOne({ _id: partnerOrder._id });
    const desc = err?.error?.description ?? err?.message ?? 'Could not reach Razorpay';
    throw ApiError.badRequest(String(desc));
  }

  partnerOrder.payment.providerOrderId = rzOrder.id;
  await partnerOrder.save();

  return {
    partnerOrderId: partnerOrder._id,
    razorpayOrderId: rzOrder.id,
    keyId: env.razorpay.keyId,
    amount: amountPaise,
    currency: 'INR',
    customerName: draft.address.fullName || 'Customer',
    description: `PartnerCart · ${partnerOrder.orderNumber}`,
  };
};

/** After Checkout success handler — verifies signature, fulfills inventory, notifies. */
export const verifyRazorpayPayment = async (userId, orderId, body) => {
  if (!env.razorpay?.keySecret) {
    throw ApiError.badRequest('Razorpay is not configured on the server.');
  }

  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) throw ApiError.notFound('Order');

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

  if (order.payment.status === PAYMENT_STATUS.PAID) {
    return Order.findById(orderId).lean();
  }

  if (order.payment.method !== PAYMENT_METHOD.RAZORPAY) {
    throw ApiError.badRequest('This order is not awaiting Razorpay payment');
  }
  if (!order.payment.providerOrderId || order.payment.providerOrderId !== razorpayOrderId) {
    throw ApiError.badRequest('Razorpay order id does not match this checkout');
  }

  const sigOk = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    env.razorpay.keySecret
  );
  if (!sigOk) throw ApiError.badRequest('Could not verify payment signature');

  try {
    await validateStockAgainstOrderSnapshots(order);
  } catch (e) {
    order.payment.status = PAYMENT_STATUS.FAILED;
    await order.save();
    throw e;
  }

  order.payment.status = PAYMENT_STATUS.PAID;
  order.payment.providerPaymentId = razorpayPaymentId;
  order.payment.providerSignature = razorpaySignature;
  order.payment.paidAt = new Date();
  await order.save();

  await decrementStockFromSnapshots(order);

  const cartDoc = await Cart.findOne({ user: userId });
  if (!cartDoc) throw ApiError.badRequest('Cart session missing — refresh checkout');
  await emitNewOrderSideEffects(order, userId, cartDoc);

  return Order.findById(orderId).lean();
};

/** Drops an unpaid Razorpay checkout draft (customer closed payment modal without paying). */
export const abandonUnpaidRazorpayCheckout = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) throw ApiError.notFound('Order');
  if (order.payment.method !== PAYMENT_METHOD.RAZORPAY) {
    throw ApiError.badRequest('This order cannot be discarded from checkout');
  }
  if (order.payment.status === PAYMENT_STATUS.PAID) {
    return { discarded: false };
  }
  await Order.deleteOne({ _id: order._id });
  return { discarded: true };
};

export const myOrders = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {
    customer: userId,
    $nor: [
      {
        $and: [
          { 'payment.method': PAYMENT_METHOD.RAZORPAY },
          { 'payment.status': PAYMENT_STATUS.UNPAID },
        ],
      },
    ],
  };
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const orderById = async (userId, role, id, vendorId) => {
  const order = await Order.findById(id)
    .populate('orderGroups.vendor', 'storeName slug logo')
    .populate('customer', 'name email phone')
    .lean();
  if (!order) throw ApiError.notFound('Order');

  const isCustomer = role === 'customer' && String(order.customer._id) === String(userId);
  const isAdmin = role === 'admin';
  const isVendor =
    role === 'vendor' &&
    vendorId &&
    order.orderGroups.some((g) => String(g.vendor._id) === String(vendorId));

  if (!isCustomer && !isAdmin && !isVendor) throw ApiError.forbidden();

  if (role === 'vendor') {
    order.orderGroups = order.orderGroups.filter(
      (g) => String(g.vendor._id) === String(vendorId)
    );
  }
  return order;
};

export const vendorOrders = async (vendorId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const match = { 'orderGroups.vendor': new mongoose.Types.ObjectId(vendorId) };
  if (query.status) match['orderGroups.status'] = query.status;
  const items = await Order.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        orderNumber: 1,
        createdAt: 1,
        customer: 1,
        total: 1,
        payment: 1,
        orderGroups: {
          $filter: {
            input: '$orderGroups',
            as: 'g',
            cond: { $eq: ['$$g.vendor', new mongoose.Types.ObjectId(vendorId)] },
          },
        },
      },
    },
  ]);
  const total = await Order.countDocuments(match);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const updateGroupStatus = async (vendorId, orderId, groupId, { status, note, trackingNumber }) => {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order');
  const group = order.orderGroups.id(groupId);
  if (!group) throw ApiError.notFound('Order group');
  if (String(group.vendor) !== String(vendorId)) throw ApiError.forbidden();

  const allowed = [...ORDER_STATUS_FLOW, ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED, ORDER_STATUS.REFUNDED];
  if (!allowed.includes(status)) throw ApiError.badRequest('Invalid status');

  group.status = status;
  group.statusHistory.push({ status, note, at: new Date() });
  if (trackingNumber) group.trackingNumber = trackingNumber;
  if (status === ORDER_STATUS.DELIVERED) group.deliveredAt = new Date();
  if (status === ORDER_STATUS.CANCELLED) group.cancelledAt = new Date();

  await order.save();

  await createAndDeliver({
    user: order.customer,
    type: NOTIFICATION_TYPE.ORDER,
    title: `Order ${status.replace(/_/g, ' ')}`,
    body: `Order ${order.orderNumber} status updated to ${status.replace(/_/g, ' ')}.`,
    link: `/app/orders/${order._id}`,
    data: { orderId: order._id, groupId: group._id, status },
  });
  emitToUser(String(order.customer), 'order:status', {
    orderId: order._id,
    groupId: group._id,
    status,
  });
  return order;
};

export const cancelOrder = async (userId, orderId, { groupId, reason }) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) throw ApiError.notFound('Order');

  const groups = groupId ? [order.orderGroups.id(groupId)] : order.orderGroups;
  for (const group of groups) {
    if (!group) continue;
    if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY].includes(group.status)) {
      throw ApiError.badRequest('Order group cannot be cancelled at this stage');
    }
    group.status = ORDER_STATUS.CANCELLED;
    group.cancelReason = reason;
    group.cancelledAt = new Date();
    group.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: reason, at: new Date() });

    for (const item of group.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, salesCount: -item.quantity } }
      );
    }
  }

  await order.save();
  emitToUser(String(userId), 'order:status', { orderId: order._id, status: 'cancelled' });
  return order;
};

export const requestReturn = async (userId, orderId, groupId, reason) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) throw ApiError.notFound('Order');
  const group = order.orderGroups.id(groupId);
  if (!group) throw ApiError.notFound('Order group');
  if (group.status !== ORDER_STATUS.DELIVERED) {
    throw ApiError.badRequest('Only delivered orders can be returned');
  }
  group.returnRequest = { status: 'requested', reason, requestedAt: new Date() };
  await order.save();
  emitToVendor(String(group.vendor), 'order:return', {
    orderId: order._id,
    groupId: group._id,
  });
  return order;
};
