import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { ApiError } from '../utils/ApiError.js';
import { VENDOR_STATUS } from '../constants/index.js';

const populateCart = (cart) =>
  cart.populate([
    { path: 'items.product', select: 'title slug images price stock isPublished isDeleted vendor' },
    { path: 'items.vendor', select: 'storeName slug logo status' },
  ]);

export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  await populateCart(cart);
  return cart;
};

export const addItem = async (userId, { productId, quantity, variantId }) => {
  const product = await Product.findById(productId);
  if (!product || product.isDeleted || !product.isPublished) {
    throw ApiError.notFound('Product unavailable');
  }
  if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');

  const seller = await Vendor.findById(product.vendor).select('status').lean();
  if (!seller || seller.status !== VENDOR_STATUS.VERIFIED) {
    throw ApiError.badRequest('That product is unavailable — the seller is not active.');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existing = cart.items.find(
    (i) =>
      String(i.product) === String(productId) &&
      String(i.variantId || '') === String(variantId || '')
  );

  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
    existing.priceSnapshot = product.price;
  } else {
    cart.items.push({
      product: product._id,
      vendor: product.vendor,
      variantId: variantId || null,
      quantity,
      priceSnapshot: product.price,
      titleSnapshot: product.title,
      imageSnapshot: product.images?.[0]?.url,
    });
  }

  await cart.save();
  await populateCart(cart);
  return cart;
};

export const updateItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart');
  const item = cart.items.find((i) => String(i.product) === String(productId));
  if (!item) throw ApiError.notFound('Item');
  if (quantity === 0) {
    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await populateCart(cart);
  return cart;
};

export const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart');
  cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
  await cart.save();
  await populateCart(cart);
  return cart;
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();
  await populateCart(cart);
  return cart;
};
