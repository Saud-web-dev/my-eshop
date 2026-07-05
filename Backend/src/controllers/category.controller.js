import Category from '../model/categorySchema.js';
import fs from 'fs';
import path from 'path';

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get single category
export const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Create category with image
export const createCategory = async (req, res) => {
    try {
        let imageData = {};

        // Agar image upload hui hai
        if (req.file) {
            imageData = {
                url: `/uploads/${req.file.filename}`,  // Local path
                filename: req.file.filename
            };
        }

        const category = await Category.create({
            ...req.body,
            image: imageData
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        // Agar image upload hui aur error aaya to image delete karo
        if (req.file) {
            fs.unlinkSync(path.join('uploads', req.file.filename));
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Update category with image
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        let updateData = { ...req.body };

        // Nayi image aayi?
        if (req.file) {
            // Purani image delete karo
            if (category.image?.filename) {
                const oldPath = path.join('uploads', category.image.filename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            updateData.image = {
                url: `/uploads/${req.file.filename}`,
                filename: req.file.filename
            };
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(path.join('uploads', req.file.filename));
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Check: Category mein products hain?
        const Product = (await import('../model/productSchema.js')).default;
        const productCount = await Product.countDocuments({ category: req.params.id });
        
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete! ${productCount} products exist in this category`
            });
        }

        // Image delete karo
        if (category.image?.filename) {
            const imagePath = path.join('uploads', category.image.filename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await category.deleteOne();

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};