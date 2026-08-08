import { Router } from 'express';
import {
  getProductReviews, createReview, voteHelpful,
  reportReview, getMyReviews, adminGetAllReviews, moderateReview,
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { reviewUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Protected
router.use(protect);
router.get('/my-reviews',            getMyReviews);
router.post('/',                     reviewUpload.array('images', 5), createReview);
router.patch('/:id/helpful',         voteHelpful);
router.post('/:id/report',           reportReview);

// Admin
router.get('/',                    authorize('admin'), adminGetAllReviews);
router.patch('/:id/moderate',      authorize('admin'), moderateReview);

export default router;
