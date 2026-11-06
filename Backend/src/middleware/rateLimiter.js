import rateLimit from 'express-rate-limit';

const createLimiter = (config) => rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  ...config,
});

export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
});

export const otpLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Please wait before requesting another.' },
});

export const passwordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password attempts. Please wait an hour.' },
});
