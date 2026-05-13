import { Wishlist } from '../models/Wishlist.js';

export const get = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    select: 'title slug images price rating vendor',
    populate: { path: 'vendor', select: 'storeName slug' },
  });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

export const add = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate('products', 'title slug images price rating');
  return wishlist;
};

export const remove = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate('products', 'title slug images price rating');
  return wishlist;
};
