import { Router } from 'express';
import {
  getAllCoupons, createCoupon, updateCoupon,
  deleteCoupon, validateCoupon,
} from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Validate coupon (customer, must be logged in)
router.post('/validate', protect, validateCoupon);

// Admin only
router.use(protect, authorize('admin'));
router.get('/',       getAllCoupons);
router.post('/',      createCoupon);
router.put('/:id',    updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
