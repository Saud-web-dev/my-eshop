import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrder, cancelOrder,
  adminGetAllOrders, updateOrderStatus, requestReturn, trackOrder,
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public order tracking
router.post('/track', trackOrder);

// All other order routes require login
router.use(protect);

// Customer routes
router.post('/',                createOrder);
router.get('/my-orders',        getMyOrders);
router.get('/:id',              getOrder);
router.patch('/:id/cancel',     cancelOrder);
router.post('/:id/return',      requestReturn);

// Admin routes
router.get('/',                     authorize('admin', 'manager', 'staff'), adminGetAllOrders);
router.patch('/:id/status',         authorize('admin', 'manager', 'staff'), updateOrderStatus);

export default router;
