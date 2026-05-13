import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

const recomputeProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'published' } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    'rating.average': Math.round(avg * 10) / 10,
    'rating.count': count,
  });
};

export const listForProduct = async (productId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { product: productId, status: 'published' };
  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit }, total) };
};

export const createReview = async (userId, data) => {
  const product = await Product.findById(data.productId);
  if (!product) throw ApiError.notFound('Product');
  try {
    const review = await Review.create({
      product: product._id,
      vendor: product.vendor,
      user: userId,
      order: data.orderId,
      rating: data.rating,
      title: data.title,
      body: data.body,
    });
    await recomputeProductRating(product._id);
    if (product.vendor) {
      const all = await Review.aggregate([
        { $match: { vendor: product.vendor, status: 'published' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      const { avg = 0, count = 0 } = all[0] || {};
      await Vendor.findByIdAndUpdate(product.vendor, {
        'rating.average': Math.round(avg * 10) / 10,
        'rating.count': count,
      });
    }
    return review;
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('You already reviewed this product');
    throw err;
  }
};

export const setReviewStatus = async (reviewId, status) => {
  const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
  if (!review) throw ApiError.notFound('Review');
  await recomputeProductRating(review.product);
  return review;
};
