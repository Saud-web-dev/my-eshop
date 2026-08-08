import Product from '../models/Product.js';
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
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
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
