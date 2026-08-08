import Coupon from '../models/Coupon.js';
import Offer from '../models/Offer.js';

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const searchCode = code?.trim()?.toUpperCase();
    if (!searchCode) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    let coupon = await Coupon.findOne({ code: searchCode, isActive: true });

    // Fallback: Check if this promo code belongs to an active Offer
    if (!coupon) {
      const now = new Date();
      const offer = await Offer.findOne({
        promoCode: searchCode,
        isActive: true,
        $and: [
          { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
        ],
      });

      if (offer) {
        const discountValue = offer.discountPercent || 0;
        const discount = Math.round(((cartTotal * discountValue) / 100) * 100) / 100;
        return res.status(200).json({
          success: true,
          coupon: {
            code: offer.promoCode,
            type: 'percentage',
            value: discountValue,
            discount,
            offerTitle: offer.title,
          },
        });
      }

      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (coupon.expiresAt && coupon.expiresAt < Date.now())
      return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    if (cartTotal < (coupon.minOrderAmount || 0))
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₨${coupon.minOrderAmount} required.`,
      });

    // Check per-user limit
    if (req.user) {
      const userUsage = coupon.usedBy.filter(u => u.user?.toString() === req.user._id?.toString()).length;
      if (userUsage >= (coupon.usagePerUser || 1))
        return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    let discount = coupon.type === 'percentage'
      ? Math.min((cartTotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
      : coupon.value;

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
