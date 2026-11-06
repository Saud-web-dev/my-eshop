import { Router } from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getAllFaqs);

// Admin only
router.post('/',    protect, authorize('admin', 'manager', 'staff'), createFaq);
router.put('/:id',  protect, authorize('admin', 'manager', 'staff'), updateFaq);
router.delete('/:id', protect, authorize('admin', 'manager', 'staff'), deleteFaq);

export default router;
