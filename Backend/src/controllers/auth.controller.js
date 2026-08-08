import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateResetToken,
  hashToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/tokenUtils.js';
import {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Shared OTP helper ─────────────────────────────────────────────────────────
const createAndSendOTP = async (email, purpose) => {
  const otp = generateOTP();
  await OTP.deleteMany({ email, purpose });
  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRY || 300) * 1000),
  });

  // Always log OTP to server console so dev can verify even when email fails
  console.log(`\n${'='.repeat(56)}`);
  console.log(`  OTP for ${email} [${purpose}]: ${otp}`);
  console.log(`${'='.repeat(56)}\n`);

  let sent = false;
  try {
    await sendOTPEmail(email, otp, purpose);
    sent = true;
  } catch (e) {
    console.error('Email send failed (check EMAIL_PASS in .env):', e.message);
  }
  return { otp, sent };
};

// ─── CHECK ADMIN EXISTS ──────────────────────────────────────────────────────
export const checkAdminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('_id');
    res.status(200).json({ success: true, exists: !!admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN REGISTER (first-time, requires ADMIN_SETUP_KEY) ───────────────────
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY)
      return res.status(403).json({ success: false, message: 'Invalid setup key.' });

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    if (await User.findOne({ role: 'admin' }))
      return res.status(403).json({ success: false, message: 'Admin account already exists.' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role: 'admin' });
    const { otp, sent } = await createAndSendOTP(email, 'email-verification');

    res.status(201).json({
      success: true,
      message: sent
        ? 'Admin account created. Check your email for the OTP.'
        : 'Admin account created. Email delivery failed — check server console for OTP.',
      email: user.email,
      ...(!sent && { otp }),
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role: 'user' });
    const { otp, sent } = await createAndSendOTP(email, 'email-verification');

    res.status(201).json({
      success: true,
      message: sent
        ? 'Registration successful. Check your email for the OTP.'
        : 'Registration successful. Email delivery failed — check server console for OTP.',
      email: user.email,
      ...(!sent && { otp }),
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'email-verification' } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const record = await OTP.findOne({ email, purpose, verified: false });
    if (!record)
      return res.status(400).json({ success: false, message: 'OTP not found or already used.' });

    if (record.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        await OTP.deleteOne({ _id: record._id });
        return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
      }
      await record.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - record.attempts} attempt(s) remaining.`,
      });
    }

    record.verified = true;
    await record.save();

    if (purpose === 'email-verification') {
      const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      const accessToken  = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id, user.role);
      user.refreshToken = refreshToken;
      user.lastLogin    = new Date();
      await user.save({ validateBeforeSave: false });
      setTokenCookies(res, accessToken, refreshToken);

      sendWelcomeEmail(user.email, user.name).catch(e =>
        console.error('Welcome email failed:', e.message)
      );

      return res.status(200).json({
        success: true,
        message: 'Email verified.',
        user,
        accessToken,
        isFirstAdmin: user.role === 'admin',
      });
    }

    res.status(200).json({ success: true, message: 'OTP verified.', email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'email-verification' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    if (!await User.findOne({ email }))
      return res.status(404).json({ success: false, message: 'No account with this email.' });

    const { otp, sent } = await createAndSendOTP(email, purpose);

    res.status(200).json({
      success: true,
      message: sent ? 'OTP sent to your email.' : 'OTP generated. Check server console.',
      ...(!sent && { otp }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });

    if (!user.isVerified)
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });

    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken  = refreshToken;
    user.lastLogin     = new Date();
    user.rememberMe    = rememberMe;
    await user.save({ validateBeforeSave: false });
    setTokenCookies(res, accessToken, refreshToken, rememberMe);

    res.status(200).json({ success: true, message: 'Login successful.', user: user.toJSON(), accessToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GOOGLE AUTH ──────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { credential, role = 'user' } = req.body;
    if (!credential)
      return res.status(400).json({ success: false, message: 'Google credential required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name, email, googleId,
        avatar: picture ? { url: picture } : undefined,
        isVerified: true,
        role: role === 'admin' ? 'admin' : 'user',
      });
      sendWelcomeEmail(email, name).catch(e => console.error('Welcome email:', e.message));
    } else {
      if (!user.googleId)       user.googleId     = googleId;
      if (!user.avatar?.url && picture) user.avatar = { url: picture };
      if (!user.isVerified)     user.isVerified   = true;
    }

    user.lastLogin     = new Date();
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Account created.' : 'Login successful.',
      user: user.toJSON(),
      accessToken,
      isNewUser,
      isFirstAdmin: user.role === 'admin' && isNewUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    if (req.user) await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Logged out.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Session expired.' });
    }

    const newAccessToken  = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken     = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setTokenCookies(res, newAccessToken, newRefreshToken, user.rememberMe);

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name images price salePrice slug');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name)  updateData.name  = req.body.name;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.file) {
      updateData['avatar.url']      = req.file.path;
      updateData['avatar.publicId'] = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user.password)
      return res.status(400).json({ success: false, message: 'Google accounts cannot change password here.' });

    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });

    const resetToken = generateResetToken();
    user.resetPasswordToken  = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    sendPasswordResetEmail(email, resetToken).catch(e =>
      console.error('Reset email failed:', e.message)
    );

    res.status(200).json({ success: true, message: 'Password reset link sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, message: 'Token and password required.' });

    const user = await User.findOne({
      resetPasswordToken:  hashToken(token),
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Password reset. Please log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name slug images price salePrice stock isActive isDeleted averageRating reviewCount');
    const wishlist = user.wishlist.filter(p => p.isActive && !p.isDeleted);
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx  = user.wishlist.indexOf(productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else          user.wishlist.push(productId);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
    user.addresses.push(req.body);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });

    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
    if (label) addr.label = label;
    if (fullName) addr.fullName = fullName;
    if (phone) addr.phone = phone;
    if (addressLine1) addr.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) addr.addressLine2 = addressLine2;
    if (city) addr.city = city;
    if (state) addr.state = state;
    if (postalCode) addr.postalCode = postalCode;
    if (country) addr.country = country;

    if (isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
      addr.isDefault = true;
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });

    user.addresses.forEach(a => (a.isDefault = false));
    addr.isDefault = true;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Account deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
