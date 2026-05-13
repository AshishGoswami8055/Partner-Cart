export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
});

export const ROLE_VALUES = Object.values(ROLES);

export const VENDOR_STATUS = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
});

export const VENDOR_TIER = Object.freeze({
  BASIC: 'basic',
  PREMIUM: 'premium',
  VERIFIED: 'verified',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
});

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
});

export const PAYMENT_METHOD = Object.freeze({
  COD: 'cod',
  RAZORPAY: 'razorpay',
});

export const NOTIFICATION_TYPE = Object.freeze({
  ORDER: 'order',
  CHAT: 'chat',
  VENDOR: 'vendor',
  SYSTEM: 'system',
  PROMO: 'promo',
});

export const REVIEW_STATUS = Object.freeze({
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
  FLAGGED: 'flagged',
});
