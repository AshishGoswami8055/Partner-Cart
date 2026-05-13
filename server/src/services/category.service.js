import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slug.js';

export const listCategories = async () => {
  const items = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  return items;
};

export const createCategory = async (data) => {
  const slug = await uniqueSlug(Category, data.name);
  return Category.create({ ...data, slug });
};

export const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category');
  if (data.name && data.name !== category.name) {
    category.slug = await uniqueSlug(Category, data.name, { ignoreId: category._id });
  }
  Object.assign(category, data);
  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Category');
};
