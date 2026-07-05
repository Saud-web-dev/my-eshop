import express from 'express';
import upload from '../middlewares/multer.js';
import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    deleteProductImage
} from '../controllers/product.controller.js';

const router = express.Router();

// Pehle ye route (warna :id se conflict hoga)
router.get('/category/:categoryId', getProductsByCategory);

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', upload.array('images', 5), createProduct); // Max 5 images
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);
router.delete('/:id/images/:filename', deleteProductImage);

export default router;