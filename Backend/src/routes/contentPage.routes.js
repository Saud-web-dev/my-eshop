import { Router } from 'express';
import {
  getAllPages, getPage, createPage, updatePage, deletePage,
} from '../controllers/contentPage.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { settingsUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/', getAllPages);
router.get('/:slug', getPage);

// Admin only
router.post('/',    protect, authorize('admin'), settingsUpload.single('image'), createPage);
router.put('/:id',  protect, authorize('admin'), settingsUpload.single('image'), updatePage);
router.delete('/:id', protect, authorize('admin'), deletePage);

export default router;
