import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateResetToken,
  hashOTP,
  compareOTP,
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
  const otpHash = hashOTP(otp);

  await OTP.deleteMany({ email, purpose });
  await OTP.create({
    email,
    otpHash,
    purpose,
    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRY || 300) * 1000),
  });

  let sent = false;
  try {
    await sendOTPEmail(email, otp, purpose);
    sent = true;
  } catch (e) {
    console.error('Email send failed (check SMTP settings in Backend/.env):', e.message);
  }
  return { sent };
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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY)
      return res.status(403).json({ success: false, message: 'Invalid setup key.' });

    if (!name || !normalizedEmail || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    if (await User.findOne({ role: 'admin' }))
      return res.status(403).json({ success: false, message: 'Admin account already exists.' });

    if (await User.findOne({ email: normalizedEmail }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    if (String(password).length < 10)
      return res.status(400).json({ success: false, message: 'Password must be at least 10 characters.' });

    const user = await User.create({ name, email: normalizedEmail, password, role: 'admin' });
    const { sent } = await createAndSendOTP(normalizedEmail, 'email-verification');

    res.status(201).json({
      success: true,
      message: sent
        ? 'Admin account created. Check your email for the OTP.'
        : 'Admin account created. Please try again if the OTP email does not arrive.',
      email: user.email,
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
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name || !normalizedEmail || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    if (String(password).length < 10)
      return res.status(400).json({ success: false, message: 'Password must be at least 10 characters.' });

    if (await User.findOne({ email: normalizedEmail }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email: normalizedEmail, password, role: 'user' });
    const { sent } = await createAndSendOTP(normalizedEmail, 'email-verification');

    res.status(201).json({
      success: true,
      message: sent
        ? 'Registration successful. Check your email for the OTP.'
        : 'Registration successful. Please try again if the OTP email does not arrive.',
      email: user.email,
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

    const record = await OTP.findOne({ email: String(email).toLowerCase(), purpose, verified: false }).select('+otpHash');
    if (!record)
      return res.status(400).json({ success: false, message: 'OTP not found or already used.' });

    if (record.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (!compareOTP(otp, record.otpHash)) {
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
      const user = await User.findOneAndUpdate({ email: String(email).toLowerCase() }, { isVerified: true }, { new: true });
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      user.sessionVersion = user.sessionVersion || 1;
      const accessToken  = generateAccessToken(user._id, user.role, user.sessionVersion);
      const refreshToken = generateRefreshToken(user._id, user.role, user.sessionVersion);
      user.refreshToken = hashToken(refreshToken);
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

    res.status(200).json({ success: true, message: 'OTP verified.', email: String(email).toLowerCase() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'email-verification' } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ success: false, message: 'Email is required.' });

    const userExists = await User.exists({ email: normalizedEmail });
    if (!userExists) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, an OTP has been sent.',
      });
    }

    const { sent } = await createAndSendOTP(normalizedEmail, purpose);

    res.status(200).json({
      success: true,
      message: sent ? 'OTP sent to your email.' : 'Please try again in a moment.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
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

    user.sessionVersion = user.sessionVersion || 1;
    const accessToken  = generateAccessToken(user._id, user.role, user.sessionVersion);
    const refreshToken = generateRefreshToken(user._id, user.role, user.sessionVersion);
    user.refreshToken  = hashToken(refreshToken);
    user.lastLogin     = new Date();
    user.rememberMe    = !!rememberMe;
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
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ success: false, message: 'Google credential required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || payload.email_verified !== true) {
      return res.status(403).json({ success: false, message: 'Google email must be verified.' });
    }

    const googleId = payload.sub;
    const normalizedEmail = String(payload.email).toLowerCase();
    const name = payload.name || normalizedEmail.split('@')[0];
    const picture = payload.picture;

    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name,
        email: normalizedEmail,
        googleId,
        avatar: picture ? { url: picture } : undefined,
        isVerified: true,
        role: 'user',
      });
      sendWelcomeEmail(normalizedEmail, name).catch(e => console.error('Welcome email:', e.message));
    } else {
      const hadUnverifiedPasswordAccount = !user.googleId && !user.isVerified && user.password;
      if (!user.googleId) user.googleId = googleId;
      if (picture && /^https:\/\/.+/i.test(picture)) {
        user.avatar = { url: picture, publicId: user.avatar?.publicId || '' };
      }
      if (hadUnverifiedPasswordAccount) {
        user.password = undefined;
      }
      if (!user.isVerified) user.isVerified = true;
      if (user.email && user.email !== normalizedEmail) {
        user.email = normalizedEmail;
      }
    }

    user.lastLogin = new Date();
    user.sessionVersion = user.sessionVersion || 1;
    const accessToken = generateAccessToken(user._id, user.role, user.sessionVersion);
    const refreshToken = generateRefreshToken(user._id, user.role, user.sessionVersion);
    user.refreshToken = hashToken(refreshToken);
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
    if (req.user) {
      const newSessionVersion = (req.user.sessionVersion || 1) + 1;
      await User.findByIdAndUpdate(req.user._id, {
        refreshToken: null,
        sessionVersion: newSessionVersion,
        passwordChangedAt: req.user.passwordChangedAt || new Date(),
      });
    }
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
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: 'zahoor-fragrance',
        audience: 'zahoor-fragrance-users',
      });
    } catch {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.sessionVersion !== decoded.sessionVersion || user.refreshToken !== hashToken(token)) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, message: 'Session expired.' });
    }

    user.sessionVersion = user.sessionVersion || 1;
    const newAccessToken  = generateAccessToken(user._id, user.role, user.sessionVersion);
    const newRefreshToken = generateRefreshToken(user._id, user.role, user.sessionVersion);
    user.refreshToken     = hashToken(newRefreshToken);
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
    user.passwordChangedAt = new Date();
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    user.refreshToken = undefined;
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

    const normalizedEmail = String(email).toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const resetToken = generateResetToken();
      user.resetPasswordToken  = hashToken(resetToken);
      user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      sendPasswordResetEmail(normalizedEmail, resetToken).catch(e =>
        console.error('Reset email failed:', e.message)
      );
    }

    res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
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
    user.passwordChangedAt    = new Date();
    user.sessionVersion       = (user.sessionVersion || 1) + 1;
    user.refreshToken         = undefined;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpire  = undefined;
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
