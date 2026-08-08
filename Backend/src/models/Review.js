import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: { type: String, trim: true },
    comment: {
      type: String,
      trim: true,
      required: [true, 'Review comment is required'],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    adminReply: {
      comment: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product average rating after save
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product, isApproved: true, isHidden: false } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
