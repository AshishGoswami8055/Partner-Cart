import { Vendor } from '../models/Vendor.js';
import { VendorApplication } from '../models/VendorApplication.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slug.js';
import { ROLES, VENDOR_STATUS, NOTIFICATION_TYPE } from '../constants/index.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { emitToAdmin, emitToUser } from '../sockets/emit.js';
import { createAndDeliver } from './notification.service.js';

export const submitApplication = async (userId, data) => {
  const existingPending = await VendorApplication.findOne({ user: userId, status: 'pending' });
  if (existingPending) throw ApiError.conflict('You already have a pending application');

  const user = await User.findById(userId);
  if (user.role === ROLES.VENDOR && user.vendor) {
    throw ApiError.conflict('You already have a vendor account');
  }

  const application = await VendorApplication.create({ ...data, user: userId });
  emitToAdmin('vendor:application', { applicationId: application._id });
  return application;
};

export const listApplications = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    VendorApplication.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VendorApplication.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const reviewApplication = async (adminId, applicationId, payload) => {
  const application = await VendorApplication.findById(applicationId);
  if (!application) throw ApiError.notFound('Application');
  if (application.status !== 'pending') throw ApiError.badRequest('Already reviewed');

  application.status = payload.decision === 'approve' ? 'approved' : 'rejected';
  application.reviewNote = payload.note;
  application.reviewedBy = adminId;
  application.reviewedAt = new Date();
  await application.save();

  if (payload.decision === 'approve') {
    const slug = await uniqueSlug(Vendor, application.businessName);
    const vendor = await Vendor.create({
      user: application.user,
      storeName: application.businessName,
      slug,
      description: application.description,
      website: application.website,
      address: application.address,
      status: VENDOR_STATUS.VERIFIED,
      tier: payload.tier || 'basic',
      commissionRate: payload.commissionRate ?? 10,
    });
    await User.findByIdAndUpdate(application.user, { role: ROLES.VENDOR, vendor: vendor._id });

    await createAndDeliver({
      user: application.user,
      type: NOTIFICATION_TYPE.VENDOR,
      title: 'Vendor application approved',
      body: 'Your store is live. Start adding products.',
      link: '/vendor',
    });
    emitToUser(String(application.user), 'vendor:approved', { vendorId: vendor._id });
    return { application, vendor };
  }

  await createAndDeliver({
    user: application.user,
    type: NOTIFICATION_TYPE.VENDOR,
    title: 'Vendor application update',
    body: payload.note || 'Your application was not approved at this time.',
  });
  emitToUser(String(application.user), 'vendor:rejected', { applicationId });
  return { application };
};

export const listVendorsPublic = async (query) => {
  const filter = { status: VENDOR_STATUS.VERIFIED };
  if (query.q) filter.$text = { $search: query.q };
  if (query.city) filter['address.city'] = new RegExp(query.city, 'i');
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    Vendor.find(filter)
      .sort({ isFeatured: -1, 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Vendor.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const getVendorBySlug = async (slug) => {
  const vendor = await Vendor.findOne({ slug, status: VENDOR_STATUS.VERIFIED }).lean();
  if (!vendor) throw ApiError.notFound('Vendor');
  return vendor;
};

export const getOwnStore = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (!vendor) throw ApiError.notFound('Vendor');
  return vendor;
};

export const updateOwnStore = async (vendorId, data) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw ApiError.notFound('Vendor');
  if (data.storeName && data.storeName !== vendor.storeName) {
    vendor.slug = await uniqueSlug(Vendor, data.storeName, { ignoreId: vendor._id });
  }
  Object.assign(vendor, data);
  await vendor.save();
  return vendor;
};

export const setVendorStatus = async (vendorId, { status, reason }) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw ApiError.notFound('Vendor');
  vendor.status = status;
  vendor.suspendedReason = status === VENDOR_STATUS.SUSPENDED ? reason : undefined;
  await vendor.save();
  return vendor;
};
