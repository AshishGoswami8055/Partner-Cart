import slugify from 'slugify';

export const toSlug = (input) =>
  slugify(String(input || ''), {
    lower: true,
    strict: true,
    trim: true,
  });

export const uniqueSlug = async (Model, base, { field = 'slug', ignoreId } = {}) => {
  let slug = toSlug(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const filter = { [field]: candidate };
    if (ignoreId) filter._id = { $ne: ignoreId };
    const exists = await Model.exists(filter);
    if (!exists) return candidate;
    suffix += 1;
  }
};
