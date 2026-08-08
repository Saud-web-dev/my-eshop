import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    name: String,
    value: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'Pakistan' },
    },
    // Pricing
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    // Coupon
    coupon: {
      code: String,
      discount: Number,
    },
    // Payment
    // Cash on Delivery only
    paymentMethod: {
      type: String,
      enum: ['cod'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      paidAt: Date,
    },
    // Order status
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'return_requested',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    // Shipping
    trackingNumber: String,
    courier: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    // Notes
    customerNote: String,
    adminNote: String,
    // Refund
    refundReason: String,
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
      default: 'none',
    },
    // Invoice
    invoiceNumber: String,
    invoiceUrl: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ZF-${String(count + 1001).padStart(6, '0')}`;
    this.invoiceNumber = `INV-${this.orderNumber}`;
  }
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// orderNumber already has unique:true on the field — no need for a separate index

const Order = mongoose.model('Order', orderSchema);
export default Order;
