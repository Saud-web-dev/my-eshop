import Product from '../model/product.Schema.js';
import Category from '../model/categorySchema.js';

import fs from 'fs';
import path from 'path';

// ✅ Get all products (with filters)
export const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort } = req.query;
        
        let filter = { isActive: true };
        
        if (category) filter.category = category;
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        let sortBy = {};
        if (sort === 'price-asc') sortBy.price = 1;
        else if (sort === 'price-desc') sortBy.price = -1;
        else if (sort === 'name') sortBy.name = 1;
        else sortBy.createdAt = -1;

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sortBy);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get single product
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name desc');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Create product with multiple images
export const createProduct = async (req, res) => {
    try {
        let images = [];
        let mainImage = '';

        // Multiple images handle karo
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                filename: file.filename
            }));
            mainImage = images[0].url;
        }

        const product = await Product.create({
            ...req.body,
            images: images,
            mainImage: mainImage
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name');

        res.status(201).json({
            success: true,
            data: populatedProduct
        });
    } catch (error) {
        // Error aaye to saari images delete karo
        if (req.files) {
            req.files.forEach(file => {
                const filePath = path.join('uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let updateData = { ...req.body };

        // Nayi images aayi?
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                filename: file.filename
            }));

            updateData.images = [...product.images, ...newImages];
            updateData.mainImage = updateData.images[0].url;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => {
                const filePath = path.join('uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Saari images delete karo
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                const imagePath = path.join('uploads', img.filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ 
            category: req.params.categoryId,
            isActive: true 
        }).populate('category', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Delete single image from product
export const deleteProductImage = async (req, res) => {
    try {
        const { id, filename } = req.params;

        // File system se delete
        const filePath = path.join('uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Database se remove
        const product = await Product.findByIdAndUpdate(
            id,
            { $pull: { images: { filename: filename } } },
            { new: true }
        );

        // Main image update karo
        if (product.images.length > 0) {
            product.mainImage = product.images[0].url;
        } else {
            product.mainImage = '';
        }
        await product.save();

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};