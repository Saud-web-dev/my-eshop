import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Offer title is required'], trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    promoCode: { type: String, trim: true, uppercase: true },
    // Link/CTA destination (e.g. /shop or /shop?category=xyz)
    link: { type: String, default: '/shop' },
    imageUrl: { type: String, default: '' },
    badge: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
