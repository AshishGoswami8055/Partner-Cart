import { apiClient, unwrap, unwrapMeta } from './client.js';

export const authApi = {
  login: (body) => apiClient.post('/auth/login', body).then(unwrap),
  register: (body) => apiClient.post('/auth/register', body).then(unwrap),
  refresh: () => apiClient.post('/auth/refresh').then(unwrap),
  logout: () => apiClient.post('/auth/logout').then(unwrap),
  me: () => apiClient.get('/auth/me').then(unwrap),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then(unwrap),
  verifyForgotOtp: (body) => apiClient.post('/auth/verify-forgot-otp', body).then(unwrap),
  resetPassword: (body) => apiClient.post('/auth/reset-password', body).then(unwrap),
  sendChangePasswordOtp: () => apiClient.post('/auth/change-password/send-otp').then(unwrap),
  updatePassword: (body) => apiClient.patch('/auth/update-password', body).then(unwrap),
};

export const userApi = {
  updateMe: (body) => apiClient.patch('/users/me', body).then(unwrap),
  updateNotificationPrefs: (body) =>
    apiClient.patch('/users/me/notification-prefs', body).then(unwrap),
  listAddresses: () => apiClient.get('/users/me/addresses').then(unwrap),
  addAddress: (body) => apiClient.post('/users/me/addresses', body).then(unwrap),
  updateAddress: (id, body) => apiClient.patch(`/users/me/addresses/${id}`, body).then(unwrap),
  deleteAddress: (id) => apiClient.delete(`/users/me/addresses/${id}`).then(unwrap),
  adminList: (params) => apiClient.get('/users', { params }).then(unwrapMeta),
  adminBlock: (id, isBlocked) =>
    apiClient.patch(`/users/${id}/block`, { isBlocked }).then(unwrap),
};

export const vendorApi = {
  apply: (body) => apiClient.post('/vendors/applications', body).then(unwrap),
  listApplications: (params) =>
    apiClient.get('/vendors/applications', { params }).then(unwrapMeta),
  reviewApplication: (id, body) =>
    apiClient.patch(`/vendors/applications/${id}`, body).then(unwrap),
  list: (params) => apiClient.get('/vendors', { params }).then(unwrapMeta),
  bySlug: (slug) => apiClient.get(`/vendors/${slug}`).then(unwrap),
  myStore: () => apiClient.get('/vendors/me/store').then(unwrap),
  updateMyStore: (body) => apiClient.patch('/vendors/me/store', body).then(unwrap),
  myAnalytics: () => apiClient.get('/vendors/me/analytics').then(unwrap),
};

export const categoryApi = {
  list: () => apiClient.get('/categories').then(unwrap),
  create: (body) => apiClient.post('/categories', body).then(unwrap),
  update: (id, body) => apiClient.patch(`/categories/${id}`, body).then(unwrap),
  remove: (id) => apiClient.delete(`/categories/${id}`).then(unwrap),
};

export const productApi = {
  list: (params) => apiClient.get('/products', { params }).then(unwrapMeta),
  bySlug: (slug) => apiClient.get(`/products/${slug}`).then(unwrap),
  myList: (params) => apiClient.get('/products/me/list', { params }).then(unwrapMeta),
  create: (body) => apiClient.post('/products', body).then(unwrap),
  update: (id, body) => apiClient.patch(`/products/${id}`, body).then(unwrap),
  remove: (id) => apiClient.delete(`/products/${id}`).then(unwrap),
  inventory: (id, body) => apiClient.patch(`/products/${id}/inventory`, body).then(unwrap),
};

export const cartApi = {
  get: () => apiClient.get('/cart').then(unwrap),
  add: (body) => apiClient.post('/cart/items', body).then(unwrap),
  update: (productId, quantity) =>
    apiClient.patch(`/cart/items/${productId}`, { quantity }).then(unwrap),
  remove: (productId) => apiClient.delete(`/cart/items/${productId}`).then(unwrap),
  clear: () => apiClient.delete('/cart').then(unwrap),
};

export const orderApi = {
  place: (body) => apiClient.post('/orders', body).then(unwrap),
  prepareRazorpay: (body) => apiClient.post('/orders/checkout/razorpay', body).then(unwrap),
  verifyRazorpay: (partnerOrderId, body) =>
    apiClient.post(`/orders/${partnerOrderId}/payment/verify`, body).then(unwrap),
  abandonRazorpayCheckout: (partnerOrderId) =>
    apiClient.post(`/orders/${partnerOrderId}/payment/abandon`, {}).then(unwrap),
  myList: (params) => apiClient.get('/orders/me', { params }).then(unwrapMeta),
  vendorList: (params) => apiClient.get('/orders/vendor', { params }).then(unwrapMeta),
  detail: (id) => apiClient.get(`/orders/${id}`).then(unwrap),
  updateStatus: (id, gid, body) =>
    apiClient.patch(`/orders/${id}/groups/${gid}/status`, body).then(unwrap),
  cancel: (id, body) => apiClient.post(`/orders/${id}/cancel`, body).then(unwrap),
  requestReturn: (id, gid, body) =>
    apiClient.post(`/orders/${id}/groups/${gid}/return`, body).then(unwrap),
};

export const wishlistApi = {
  get: () => apiClient.get('/wishlist').then(unwrap),
  add: (productId) => apiClient.post(`/wishlist/${productId}`).then(unwrap),
  remove: (productId) => apiClient.delete(`/wishlist/${productId}`).then(unwrap),
};

export const reviewApi = {
  list: (productId, params) =>
    apiClient.get(`/reviews/product/${productId}`, { params }).then(unwrapMeta),
  create: (body) => apiClient.post('/reviews', body).then(unwrap),
  setStatus: (id, status) => apiClient.patch(`/reviews/${id}/status`, { status }).then(unwrap),
};

export const couponApi = {
  list: (params) => apiClient.get('/coupons', { params }).then(unwrapMeta),
  create: (body) => apiClient.post('/coupons', body).then(unwrap),
  apply: (code) => apiClient.post('/coupons/apply', { code }).then(unwrap),
};

export const messageApi = {
  conversations: () => apiClient.get('/messages/conversations').then(unwrap),
  start: (body) => apiClient.post('/messages/conversations', body).then(unwrap),
  thread: (id) => apiClient.get(`/messages/conversations/${id}`).then(unwrap),
  send: (id, body) => apiClient.post(`/messages/conversations/${id}/messages`, body).then(unwrap),
};

export const notificationApi = {
  list: (params) => apiClient.get('/notifications', { params }).then(unwrapMeta),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () => apiClient.patch('/notifications/read-all').then(unwrap),
};

export const adminApi = {
  stats: () => apiClient.get('/admin/stats').then(unwrap),
  vendors: (params) => apiClient.get('/admin/vendors', { params }).then(unwrapMeta),
  setVendorStatus: (id, body) =>
    apiClient.patch(`/admin/vendors/${id}/status`, body).then(unwrap),
  products: (params) => apiClient.get('/admin/products', { params }).then(unwrapMeta),
  auditLogs: () => apiClient.get('/admin/audit-logs').then(unwrap),
};

export const analyticsApi = {
  customer: () => apiClient.get('/analytics/customer').then(unwrap),
  vendor: () => apiClient.get('/analytics/vendor').then(unwrap),
  admin: () => apiClient.get('/analytics/admin').then(unwrap),
};
