import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slug.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { VENDOR_STATUS } from '../constants/index.js';

export const listProducts = async (query) => {
  const verifiedVendorIds = await Vendor.find({ status: VENDOR_STATUS.VERIFIED }).distinct('_id');
  const filter = {
    isDeleted: false,
    isPublished: true,
    vendor: verifiedVendorIds.length ? { $in: verifiedVendorIds } : { $in: [] },
  };

  if (query.q) filter.$text = { $search: query.q };
  if (query.category) filter.category = query.category;
  if (query.vendor) filter.vendor = query.vendor;
  if (query.city) filter['location.city'] = new RegExp(query.city, 'i');
  if (query.inStock === 'true') filter.stock = { $gt: 0 };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  if (query.rating) filter['rating.average'] = { $gte: query.rating };

  const { page, limit, skip, sort } = parsePagination(query);
  const sortKey = query.sort || 'createdAt';
  const sortValue = query.order === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('vendor', 'storeName slug logo rating tier status')
      .populate('category', 'name slug')
      .sort({ [sortKey]: sortValue })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildMeta({ page, limit }, total) };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isDeleted: false, isPublished: true })
    .populate('vendor', 'storeName slug logo banner rating tier status address')
    .populate('category', 'name slug')
    .lean();
  if (!product) throw ApiError.notFound('Product');
  if (!product.vendor || product.vendor.status !== VENDOR_STATUS.VERIFIED) {
    throw ApiError.notFound('Product');
  }
  await Product.updateOne({ _id: product._id }, { $inc: { viewsCount: 1 } });
  return product;
};

const ensureActiveVendor = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw ApiError.notFound('Vendor');
  if (vendor.status !== VENDOR_STATUS.VERIFIED) {
    throw ApiError.forbidden('Your store is not active');
  }
  return vendor;
};

export const createProduct = async (vendorId, data) => {
  const vendor = await ensureActiveVendor(vendorId);
  const slug = await uniqueSlug(Product, data.title);
  const product = await Product.create({
    ...data,
    slug,
    vendor: vendor._id,
    location: { city: vendor.address?.city, coordinates: vendor.address?.coordinates },
  });
  await Vendor.updateOne({ _id: vendor._id }, { $inc: { 'stats.totalProducts': 1 } });
  return product;
};

export const updateProduct = async (vendorId, id, data) => {
  const product = await Product.findOne({ _id: id, vendor: vendorId, isDeleted: false });
  if (!product) throw ApiError.notFound('Product');
  if (data.title && data.title !== product.title) {
    product.slug = await uniqueSlug(Product, data.title, { ignoreId: product._id });
  }
  Object.assign(product, data);
  await product.save();
  return product;
};

export const deleteProduct = async (vendorId, id) => {
  const product = await Product.findOneAndUpdate(
    { _id: id, vendor: vendorId, isDeleted: false },
    { isDeleted: true, isPublished: false },
    { new: true }
  );
  if (!product) throw ApiError.notFound('Product');
  await Vendor.updateOne({ _id: vendorId }, { $inc: { 'stats.totalProducts': -1 } });
};

export const adjustInventory = async (vendorId, id, { stock, delta }) => {
  const product = await Product.findOne({ _id: id, vendor: vendorId, isDeleted: false });
  if (!product) throw ApiError.notFound('Product');
  if (typeof stock === 'number') product.stock = stock;
  else if (typeof delta === 'number') product.stock = Math.max(0, product.stock + delta);
  await product.save();
  return product;
};

export const bulkCreate = async (vendorId, products = []) => {
  await ensureActiveVendor(vendorId);
  const docs = [];
  for (const p of products) {
    docs.push({
      ...p,
      vendor: vendorId,
      slug: await uniqueSlug(Product, p.title),
    });
  }
  const created = await Product.insertMany(docs);
  await Vendor.updateOne({ _id: vendorId }, { $inc: { 'stats.totalProducts': created.length } });
  return created;
};

export const listVendorProducts = async (vendorId, query) => {
  const filter = { vendor: vendorId, isDeleted: false };
  if (query.q) filter.$text = { $search: query.q };
  if (query.lowStock === 'true') {
    filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
  }
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};
