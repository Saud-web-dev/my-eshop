import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const VALID_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['return_requested', 'refunded'],
  return_requested: ['returned', 'refunded'],
  returned: ['refunded'],
  cancelled: [],
  refunded: [],
};

const validateOrderStatusTransition = (currentStatus, nextStatus) => {
  if (!nextStatus || nextStatus === currentStatus) return true;
  const allowedStates = VALID_ORDER_TRANSITIONS[currentStatus] || [];
  return allowedStates.includes(nextStatus);
};

// ─── CREATE ORDER ────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, customerNote } = req.body;

    if (!items?.length)
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });

    // Validate & build items with current prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.isDeleted)
        return res.status(400).json({ success: false, message: `Product ${item.product} not available.` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });

      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
        variant: item.variant,
      });
    }

    // Coupon
    let discount = 0;
    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > Date.now())) {
        if (subtotal >= coupon.minOrderAmount) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.value;
          }
          couponData = { code: coupon.code, discount };
          coupon.usedCount += 1;
          coupon.usedBy.push({ user: req.user._id });
          await coupon.save();
        }
      }
    }

    // Shipping & tax (fetch from settings or use defaults)
    const shippingCost = 0; // computed by shipping zones in production
    const tax = 0;
    const total = subtotal - discount + shippingCost + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      coupon: couponData,
      customerNote,
      statusHistory: [{ status: 'pending', note: 'Order placed. Cash on Delivery.' }],
    });

    // Decrement stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, salesCount: item.quantity },
      });
    }

    // Send confirmation email
    const user = await User.findById(req.user._id);
    await sendOrderConfirmationEmail(user.email, user.name, order).catch(() => {});

    const populated = await Order.findById(order._id).populate('items.product', 'name images');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET USER ORDERS ─────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TRACK ORDER (public) ────────────────────────────────────────────────────
export const trackOrder = async (req, res) => {
  try {
    const { orderId, email } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'Order number is required.' });

    const query = /^[0-9a-fA-F]{24}$/.test(orderId)
      ? { _id: orderId }
      : { orderNumber: { $regex: `^${escapeRegex(orderId)}$`, $options: 'i' } };

    const order = await Order.findOne(query)
      .populate('user', 'email')
      .populate('items.product', 'name images slug')
      .select('-shippingAddress');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found. Please check your order number.' });

    // Optional email check for guest verification
    if (email && order.user?.email && order.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'This email does not match the order.' });
    }

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber || order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE ORDER ────────────────────────────────────────────────────────
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Users can only see their own orders
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CANCEL ORDER ────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });

    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer.' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
    }

    res.status(200).json({ success: true, message: 'Order cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: GET ALL ORDERS ───────────────────────────────────────────────────
export const adminGetAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.orderNumber = { $regex: escapeRegex(search), $options: 'i' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: UPDATE ORDER STATUS ──────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    if (!validateOrderStatusTransition(order.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}.`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: req.user._id });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REQUEST RETURN ──────────────────────────────────────────────────────────
export const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });
    if (order.status !== 'delivered')
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });

    order.status = 'return_requested';
    order.refundReason = req.body.reason;
    order.refundStatus = 'requested';
    order.statusHistory.push({ status: 'return_requested', note: req.body.reason });
    await order.save();
    res.status(200).json({ success: true, message: 'Return request submitted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
