import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const ADMIN_ROLES = ['admin', 'manager', 'staff'];

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'zahoor-fragrance',
    audience: 'zahoor-fragrance-users',
  });
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }
    if (typeof decoded.sessionVersion !== 'number' || user.sessionVersion !== decoded.sessionVersion) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (user.passwordChangedAt && decoded.iat && user.passwordChangedAt.getTime() > decoded.iat * 1000) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

export const authorize = (...roles) => {
  const allowedRoles = roles.flatMap((role) => (Array.isArray(role) ? role : [role])).filter(Boolean);

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
};

export const adminOnly = [protect, authorize(ADMIN_ROLES)];
