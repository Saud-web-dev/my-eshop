import { Router } from 'express';
import {
  getDashboardStats, getRevenueChart, getTopProducts,
  getRecentOrders, getRecentCustomers, getAllCustomers,
  getOrdersByStatus, getTopCategories,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All analytics routes — admin only
router.use(protect, authorize('admin'));

router.get('/dashboard',         getDashboardStats);
router.get('/revenue-chart',     getRevenueChart);
router.get('/top-products',      getTopProducts);
router.get('/recent-orders',     getRecentOrders);
router.get('/recent-customers',  getRecentCustomers);
router.get('/customers',         getAllCustomers);
router.get('/orders-by-status',  getOrdersByStatus);
router.get('/top-categories',    getTopCategories);

export default router;
