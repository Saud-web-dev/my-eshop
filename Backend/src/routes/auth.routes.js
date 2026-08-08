import { Router } from 'express';
import {
  register, adminRegister, checkAdminExists,
  verifyOTP, resendOTP, login, googleAuth,
  logout, refreshToken, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, getWishlist, toggleWishlist,
  addAddress, updateAddress, setDefaultAddress, deleteAddress, deleteAccount,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { avatarUpload } from '../middleware/multer.js';

const router = Router();

// Public
router.get('/check-admin',       checkAdminExists);          // frontend uses this to show/hide admin signup
router.post('/admin-register',   authLimiter, adminRegister); // first-time admin setup
router.post('/register',         authLimiter,  register);
router.post('/verify-otp',                     verifyOTP);
router.post('/resend-otp',       otpLimiter,   resendOTP);
router.post('/login',            authLimiter,  login);
router.post('/google',                         googleAuth);
router.post('/refresh-token',                  refreshToken);
router.post('/forgot-password',  authLimiter,  forgotPassword);
router.post('/reset-password',                 resetPassword);

// Protected
router.use(protect);
router.post('/logout',                          logout);
router.get('/me',                               getMe);
router.put('/profile', avatarUpload.single('avatar'), updateProfile);
router.put('/change-password',                  changePassword);
router.get('/wishlist',                         getWishlist);
router.post('/wishlist',                        toggleWishlist);
router.post('/addresses',                       addAddress);
router.put('/addresses/:id',                    updateAddress);
router.patch('/addresses/:id/default',          setDefaultAddress);
router.delete('/addresses/:id',                 deleteAddress);
router.delete('/account',                       deleteAccount);

export default router;
