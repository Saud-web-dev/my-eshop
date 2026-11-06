import Category from '../models/Category.js';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAllCategories = async (req, res) => {
  try {
    const { includeInactive = 'false', parent } = req.query;
    const filter = {};
    if (includeInactive !== 'true') filter.isActive = true;
    if (parent === 'null') filter.parent = null;
    else if (parent) filter.parent = parent;

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE ──────────────────────────────────────────────────────────────
export const getCategory = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };
    const category = await Category.findOne(query).populate('parent', 'name slug');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = { url: req.file.path, publicId: req.file.filename };
    }
    const category = await Category.create(data);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkImportCategories = async (req, res) => {
  const rows = req.body?.items;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 50) {
    return res.status(400).json({ success: false, message: 'Import between 1 and 50 category rows at a time.' });
  }

  const errors = [];
  let createdCount = 0;

  for (const [index, row] of rows.entries()) {
    try {
      const name = String(row.name || '').trim();
      if (!name || name.length > 120) throw new Error('Name is required and must be at most 120 characters.');
      if (String(row.description || '').length > 500) throw new Error('Description must be at most 500 characters.');

      const parseBoolean = (value) => {
        if (value === undefined || value === '') return true;
        return ['true', '1', 'yes'].includes(String(value).trim().toLowerCase());
      };
      await Category.create({
        name,
        description: String(row.description || '').trim(),
        isActive: parseBoolean(row.isActive),
      });
      createdCount += 1;
    } catch (error) {
      errors.push({
        row: index + 2,
        message: error.code === 11000 ? 'Category name already exists.' : error.message,
      });
    }
  }

  res.status(200).json({ success: true, data: { createdCount, failedCount: errors.length, errors } });
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const existing = await Category.findById(req.params.id);
      if (existing?.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId);
      }
      data.image = { url: req.file.path, publicId: req.file.filename };
    }
    const category = await Category.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    console.log('Attempting to delete category:', req.params.id);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found.' 
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Reassign products first.`,
      });
    }

    // Delete image from Cloudinary if it exists
    if (category.image?.publicId) {
      console.log('Attempting to delete Cloudinary image:', category.image.publicId);
      try {
        const result = await cloudinary.uploader.destroy(category.image.publicId);
        console.log('Cloudinary deletion result:', result);
        
        if (result.result === 'ok') {
          console.log('Cloudinary image deleted successfully');
        } else if (result.result === 'not found') {
          console.warn('Cloudinary image not found, continuing with category deletion');
        } else {
          console.warn('Cloudinary deletion returned:', result);
          // Continue with category deletion even if Cloudinary fails
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion failed:', cloudinaryError);
        // Log error but continue with category deletion
        // This ensures the category gets deleted even if Cloudinary is down
      }
    } else {
      console.log('No Cloudinary image to delete');
    }

    // Delete the category from database
    await category.deleteOne();
    console.log('Category deleted successfully:', req.params.id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Category deleted successfully.' 
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete category' 
    });
  }
};