import { Router } from 'express';
import {
  getAllCategories, getCategory, createCategory,
  updateCategory, deleteCategory,
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { categoryUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/',    getAllCategories);
router.get('/:id', getCategory);

// Admin only
router.use(protect, authorize('admin'));
router.post('/',    categoryUpload.single('image'), createCategory);
router.put('/:id',  categoryUpload.single('image'), updateCategory);
router.delete('/:id',                               deleteCategory);

export default router;
