import { Router } from 'express';
import {
  getAllProducts, getProduct, createProduct, bulkImportProducts, updateProduct,
  deleteProduct, restoreProduct, deleteProductImage, toggleProductStatus,
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { productUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/',    getAllProducts);
router.get('/:id', getProduct);

// Admin only
router.use(protect, authorize('admin', 'manager', 'staff'));
router.post('/bulk-import', bulkImportProducts);
router.post('/',                           productUpload.array('images', 10), createProduct);
router.put('/:id',                         productUpload.array('images', 10), updateProduct);
router.delete('/:id',                      deleteProduct);
router.patch('/:id/restore',               restoreProduct);
router.patch('/:id/toggle-status',         toggleProductStatus);
router.delete('/:id/images/:publicId',     deleteProductImage);

export default router;
