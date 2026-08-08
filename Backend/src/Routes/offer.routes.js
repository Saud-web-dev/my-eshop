import { Router } from 'express';
import { getAllOffers, createOffer, updateOffer, deleteOffer } from '../controllers/offer.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { categoryUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/', getAllOffers);

// Admin only
router.post('/',    protect, authorize('admin'), categoryUpload.single('image'), createOffer);
router.put('/:id',  protect, authorize('admin'), categoryUpload.single('image'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

export default router;
