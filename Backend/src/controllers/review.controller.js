import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// ─── GET PRODUCT REVIEWS ─────────────────────────────────────────────────────
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt-desc' } = req.query;
    let targetProductId = req.params.productId;

    // Resolve slug to ObjectId if productId parameter is a slug string
    if (targetProductId && !targetProductId.match(/^[0-9a-fA-F]{24}$/)) {
      const prod = await Product.findOne({ slug: targetProductId }).select('_id');
      if (prod) {
        targetProductId = prod._id;
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: Number(page), pages: 0 },
        });
      }
    }

    const sortMap = {
      'createdAt-desc': { createdAt: -1 },
      'rating-desc': { rating: -1 },
      'helpful-desc': { helpfulVotes: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const filter = { product: targetProductId, isApproved: true, isHidden: false };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE REVIEW ───────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;
    let targetProductId = productId;

    if (targetProductId && !targetProductId.match(/^[0-9a-fA-F]{24}$/)) {
      const prod = await Product.findOne({ slug: targetProductId }).select('_id');
      if (prod) targetProductId = prod._id;
    }

    const existing = await Review.findOne({ product: targetProductId, user: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });

    // Check verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        status: 'delivered',
        'items.product': targetProductId,
      });
      if (order) isVerifiedPurchase = true;
    }

    const reviewData = {
      product: targetProductId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase,
      order: orderId,
      isApproved: true,
      isHidden: false,
    };

    if (req.files?.length) {
      reviewData.images = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    }

    const review = await Review.create(reviewData);
    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── VOTE HELPFUL ────────────────────────────────────────────────────────────
export const voteHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    const alreadyVoted = review.helpfulVoters.includes(req.user._id);
    if (alreadyVoted) {
      review.helpfulVoters.pull(req.user._id);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulVoters.push(req.user._id);
      review.helpfulVotes += 1;
    }
    await review.save();
    res.status(200).json({ success: true, helpful: !alreadyVoted, votes: review.helpfulVotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REPORT REVIEW ───────────────────────────────────────────────────────────
export const reportReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { reportedBy: req.user._id } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.status(200).json({ success: true, message: 'Review reported.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET MY REVIEWS ──────────────────────────────────────────────────────────
export const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find({ user: req.user._id })
        .populate('product', 'name images slug price salePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: GET ALL REVIEWS ──────────────────────────────────────────────────
export const adminGetAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved, isHidden } = req.query;
    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isHidden !== undefined) filter.isHidden = isHidden === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN: MODERATE ─────────────────────────────────────────────────────────
export const moderateReview = async (req, res) => {
  try {
    const { action, reply } = req.body; // approve | hide | feature | reply | delete
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (action === 'approve') review.isApproved = true;
    if (action === 'hide') review.isHidden = true;
    if (action === 'unhide') review.isHidden = false;
    if (action === 'feature') review.isFeatured = !review.isFeatured;
    if (action === 'delete') { await review.deleteOne(); return res.status(200).json({ success: true, message: 'Review deleted.' }); }
    if (action === 'reply' && reply) review.adminReply = { comment: reply, repliedAt: new Date() };

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
