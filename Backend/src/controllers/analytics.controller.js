import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// ─── DASHBOARD OVERVIEW ──────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      lastMonthOrders,
      totalCustomers,
      newCustomersThisMonth,
      totalProducts,
      lowStockProducts,
      pendingReviews,
      pendingOrders,
      revenueThisMonth,
      revenueLastMonth,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true, isDeleted: false }),
      Review.countDocuments({ isApproved: false }),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const currentRevenue = revenueThisMonth[0]?.total || 0;
    const prevRevenue = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : 100;

    const orderGrowth = lastMonthOrders > 0
      ? Math.round(((monthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 100;

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: currentRevenue,
          lastMonth: prevRevenue,
          growth: revenueGrowth,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
          pending: pendingOrders,
          growth: orderGrowth,
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        reviews: { pending: pendingReviews },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REVENUE CHART (last 12 months) ─────────────────────────────────────────
export const getRevenueChart = async (req, res) => {
  try {
    const months = 12;
    const data = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - months)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOP PRODUCTS ────────────────────────────────────────────────────────────
export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .sort({ salesCount: -1 })
      .limit(10)
      .select('name images price salePrice salesCount averageRating reviewCount');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RECENT ORDERS ───────────────────────────────────────────────────────────
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ORDERS BY STATUS ────────────────────────────────────────────────────────
export const getOrdersByStatus = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOP CATEGORIES ──────────────────────────────────────────────────────────
export const getTopCategories = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'cat' } },
      {
        $group: {
          _id: { $ifNull: [{ $arrayElemAt: ['$cat.name', 0] }, 'Uncategorized'] },
          sold: { $sum: '$sold' },
          revenue: { $sum: '$revenue' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RECENT CUSTOMERS ─────────────────────────────────────────────────────────
export const getRecentCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email avatar createdAt isVerified');
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: ALL CUSTOMERS ────────────────────────────────────────────────────
export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
