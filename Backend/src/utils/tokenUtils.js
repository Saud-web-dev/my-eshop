import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate access token (short-lived)
export const generateAccessToken = (userId, role, sessionVersion = 1) => {
  return jwt.sign({ id: userId, role, sessionVersion, iss: 'zahoor-fragrance', aud: 'zahoor-fragrance-users' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    algorithm: 'HS256',
  });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (userId, role, sessionVersion = 1) => {
  return jwt.sign({ id: userId, role, sessionVersion, iss: 'zahoor-fragrance', aud: 'zahoor-fragrance-users' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString().padStart(6, '0');
};

export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

export const compareOTP = (candidate, expectedHash) => {
  const expected = Buffer.from(expectedHash, 'hex');
  const candidateHash = Buffer.from(hashOTP(candidate), 'hex');

  if (expected.length !== candidateHash.length) return false;

  try {
    return crypto.timingSafeEqual(expected, candidateHash);
  } catch {
    return false;
  }
};

// Generate password reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash reset token for storage
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Set token cookies
export const setTokenCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
};

// Clear token cookies
export const clearTokenCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
