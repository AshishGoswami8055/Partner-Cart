import { Address } from '../models/Address.js';
import { ApiError } from '../utils/ApiError.js';

export const list = (userId) => Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

export const create = async (userId, data) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  return Address.create({ ...data, user: userId });
};

export const update = async (userId, addressId, data) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  const addr = await Address.findOneAndUpdate({ _id: addressId, user: userId }, data, { new: true });
  if (!addr) throw ApiError.notFound('Address');
  return addr;
};

export const remove = async (userId, addressId) => {
  const addr = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!addr) throw ApiError.notFound('Address');
};
