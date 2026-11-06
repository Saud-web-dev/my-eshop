import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

// ─── GET ALL (with filter/sort/search/pagination) ────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category, minPrice, maxPrice,
      sort = 'createdAt-desc', featured, trending, bestSeller,
      newArrival, flashSale, brand, tags, isActive = 'true',
    } = req.query;

    const filter = { isDeleted: false };
    if (isActive !== 'all') filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (bestSeller === 'true') filter.isBestSeller = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (flashSale === 'true') filter.isFlashSale = true;
    if (minPrice || maxPrice) {
      const minimum = minPrice === undefined ? undefined : Number(minPrice);
      const maximum = maxPrice === undefined ? undefined : Number(maxPrice);
      if ((minimum !== undefined && (!Number.isFinite(minimum) || minimum < 0))
        || (maximum !== undefined && (!Number.isFinite(maximum) || maximum < 0))
        || (minimum !== undefined && maximum !== undefined && minimum > maximum)) {
        return res.status(400).json({ success: false, message: 'Price range is invalid.' });
      }

      const effectivePrice = {
        $cond: [
          { $and: [{ $ne: ['$salePrice', null] }, { $lt: ['$salePrice', '$price'] }] },
          '$salePrice',
          '$price',
        ],
      };
      const priceConditions = [];
      if (minimum !== undefined) priceConditions.push({ $gte: [effectivePrice, minimum] });
      if (maximum !== undefined) priceConditions.push({ $lte: [effectivePrice, maximum] });
      filter.$expr = { $and: priceConditions };
    }
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) filter.$text = { $search: search };

    const sortMap = {
      'createdAt-desc': { createdAt: -1 },
      'createdAt-asc': { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'name-asc': { name: 1 },
      'rating-desc': { averageRating: -1 },
      'sales-desc': { salesCount: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkImportProducts = async (req, res) => {
  const rows = req.body?.items;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 50) {
    return res.status(400).json({ success: false, message: 'Import between 1 and 50 product rows at a time.' });
  }

  const errors = [];
  let createdCount = 0;
  const categoryCache = new Map();

  for (const [index, row] of rows.entries()) {
    try {
      const name = String(row.name || '').trim();
      const price = Number(row.price);
      const stock = Number(row.stock ?? 0);
      const categoryInput = String(row.category || '').trim();

      if (!name || name.length > 150) throw new Error('Name is required and must be at most 150 characters.');
      if (String(row.description || '').length > 600) throw new Error('Description must be at most 600 characters.');
      if (String(row.shortDescription || '').length > 250) throw new Error('Short description must be at most 250 characters.');
      if (String(row.brand || '').length > 120 || String(row.sku || '').length > 80) {
        throw new Error('Brand must be at most 120 characters and SKU at most 80 characters.');
      }
      if (String(row.tags || '').length > 200) throw new Error('Tags must be at most 200 characters.');
      if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a non-negative number.');
      if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a non-negative whole number.');
      if (!categoryInput) throw new Error('Category is required.');

      let categoryId = categoryCache.get(categoryInput.toLowerCase());
      if (!categoryId) {
        const category = /^[0-9a-fA-F]{24}$/.test(categoryInput)
          ? await Category.findById(categoryInput)
          : await Category.findOne({ name: new RegExp(`^${categoryInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
        if (!category) throw new Error(`Category "${categoryInput}" was not found. Import or create it first.`);
        categoryId = category._id;
        categoryCache.set(categoryInput.toLowerCase(), categoryId);
      }

      const salePrice = row.salePrice === '' || row.salePrice === undefined ? null : Number(row.salePrice);
      if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > price)) {
        throw new Error('Sale price must be a non-negative number no greater than the regular price.');
      }

      const tags = Array.isArray(row.tags)
        ? row.tags
        : String(row.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
      if (tags.length > 10 || tags.some(tag => String(tag).length > 40)) {
        throw new Error('Use at most 10 tags, each no longer than 40 characters.');
      }
      const parseBoolean = (value, defaultValue = false) => {
        if (value === undefined || value === '') return defaultValue;
        return ['true', '1', 'yes'].includes(String(value).trim().toLowerCase());
      };

      await Product.create({
        name,
        category: categoryId,
        price,
        salePrice,
        stock,
        brand: String(row.brand || '').trim(),
        sku: String(row.sku || '').trim(),
        description: String(row.description || '').trim(),
        shortDescription: String(row.shortDescription || '').trim(),
        tags,
        isFeatured: parseBoolean(row.isFeatured),
        isNewArrival: parseBoolean(row.isNewArrival),
        isBestSeller: parseBoolean(row.isBestSeller),
        isActive: parseBoolean(row.isActive, true),
      });
      createdCount += 1;
    } catch (error) {
      errors.push({ row: index + 2, message: error.message });
    }
  }

  res.status(200).json({ success: true, data: { createdCount, failedCount: errors.length, errors } });
};

// ─── GET SINGLE ──────────────────────────────────────────────────────────────
export const getProduct = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const product = await Product.findOne({ ...query, isDeleted: false })
      .populate('category', 'name slug description')
      .populate('subcategory', 'name slug');

    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found.' });

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const images = req.files
      ? req.files.map(f => ({ url: f.path, publicId: f.filename, alt: req.body.name }))
      : [];

    const product = await Product.create({ ...req.body, images });
    const populated = await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found.' });

    const updateData = { ...req.body };

    if (Object.hasOwn(updateData, 'salePrice')) {
      updateData.salePrice = updateData.salePrice === '' ? null : Number(updateData.salePrice);
      if (updateData.salePrice !== null
        && (!Number.isFinite(updateData.salePrice) || updateData.salePrice < 0
          || updateData.salePrice > Number(updateData.price ?? product.price))) {
        return res.status(400).json({ success: false, message: 'Sale price must be a non-negative number no greater than the regular price.' });
      }
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    if (req.files?.length) {
      const newImages = req.files.map(f => ({ url: f.path, publicId: f.filename, alt: product.name }));
      updateData.images = [...product.images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    }).populate('category', 'name slug');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── SOFT DELETE ─────────────────────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESTORE ─────────────────────────────────────────────────────────────────
export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, isActive: true },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE IMAGE ────────────────────────────────────────────────────────────
export const deleteProductImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const decoded = decodeURIComponent(publicId);

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(decoded);

    const product = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: { publicId: decoded } } },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE STATUS ───────────────────────────────────────────────────────────
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.isActive = !product.isActive;
    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
