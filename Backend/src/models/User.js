import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      minlength: [10, 'Password must be at least 10 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'manager', 'staff'],
      default: 'user',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // Refresh token and session invalidation
    refreshToken: { type: String, select: false },
    sessionVersion: { type: Number, default: 1 },
    passwordChangedAt: { type: Date, default: null },

    // Wishlist
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Addresses
    addresses: [
      {
        label: { type: String, default: 'Home' },
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'Pakistan' },
        isDefault: { type: Boolean, default: false },
      },
    ],

    // Notifications
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },

    // Remember me
    rememberMe: { type: Boolean, default: false },

    // Last login
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
