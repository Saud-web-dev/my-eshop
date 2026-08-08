import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: String, // e.g., "Size", "Color"
  value: String, // e.g., "50ml", "Red"
  sku: String,
  price: Number,
  salePrice: Number,
  stock: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Product name is required'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    salePrice: {
      type: Number,
      default: null,
    },
    sku: { type: String, trim: true },
    barcode: { type: String },
    brand: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        alt: { type: String, default: '' },
      },
    ],
    video: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    variants: [variantSchema],
    // Dimensions & Shipping
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    shippingClass: { type: String, default: 'standard' },
    // Labels
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: { type: Date },
    // Status
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    // Stats
    viewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate slug
productSchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
});

// Virtual: effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
