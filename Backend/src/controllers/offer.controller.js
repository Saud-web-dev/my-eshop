import Offer from '../models/Offer.js';
import Coupon from '../models/Coupon.js';
import cloudinary from '../config/cloudinary.js';

// Helper to sync Offer promoCode with Coupon collection
const syncOfferCoupon = async (offer) => {
  if (!offer.promoCode) return;
  const code = offer.promoCode.trim().toUpperCase();
  try {
    await Coupon.findOneAndUpdate(
      { code },
      {
        code,
        type: 'percentage',
        value: offer.discountPercent || 0,
        isActive: offer.isActive,
        expiresAt: offer.endDate || undefined,
        description: `Offer: ${offer.title}`,
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (err) {
    console.error('Failed to sync offer coupon:', err.message);
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAllOffers = async (req, res) => {
  try {
    const { includeInactive = 'false', active } = req.query;
    const filter = {};
    if (includeInactive !== 'true') filter.isActive = true;
    if (active === 'true') {
      const now = new Date();
      filter.isActive = true;
      filter.$and = [
        { $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ]},
        { $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ]},
      ];
    }

    const offers = await Offer.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createOffer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.imageUrl = req.file.path;
    data.createdBy = req.user?._id;
    const offer = await Offer.create(data);
    await syncOfferCoupon(offer);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateOffer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const existing = await Offer.findById(req.params.id);
      if (existing?.imageUrl) {
        const publicId = existing.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`zahoor-fragrance/offers/${publicId.split('/').pop()}`);
      }
      data.imageUrl = req.file.path;
    }
    const offer = await Offer.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    await syncOfferCoupon(offer);
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    if (offer.imageUrl) {
      const publicId = offer.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`zahoor-fragrance/offers/${publicId.split('/').pop()}`);
    }
    res.status(200).json({ success: true, message: 'Offer deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
