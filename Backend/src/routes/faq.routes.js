import { Router } from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getAllFaqs);

// Admin only
router.post('/',    protect, authorize('admin'), createFaq);
router.put('/:id',  protect, authorize('admin'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

export default router;
