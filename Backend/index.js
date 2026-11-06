import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './src/config/db.js';
import './src/config/cloudinary.js';

import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import couponRoutes from './src/routes/coupon.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import faqRoutes from './src/routes/faq.routes.js';
import contentPageRoutes from './src/routes/contentPage.routes.js';
import offerRoutes from './src/routes/offer.routes.js';

import { generalLimiter } from './src/middleware/rateLimiter.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

const requiredEnvKeys = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ADMIN_SETUP_KEY',
];

const requiredProductionEnvKeys = [...requiredEnvKeys, 'EMAIL_USER', 'EMAIL_PASS'];

const devDefaults = {
  MONGO_URI: 'mongodb://localhost:27017/zahoor-fragrance-dev',
  JWT_SECRET: 'dev-jwt-secret-key-for-local-testing-123456',
  JWT_REFRESH_SECRET: 'dev-refresh-secret-key-for-local-testing-123456',
  COOKIE_SECRET: 'dev-cookie-secret-key-for-local-testing-123456',
  GOOGLE_CLIENT_ID: 'dev-google-client-id',
  GOOGLE_CLIENT_SECRET: 'dev-google-client-secret',
  CLOUDINARY_CLOUD_NAME: 'demo-cloud-name',
  CLOUDINARY_API_KEY: 'demo-api-key',
  CLOUDINARY_API_SECRET: 'demo-api-secret',
  ADMIN_SETUP_KEY: 'dev-admin-setup-key-change-me',
};

const isPlaceholderValue = (value) => {
  const normalized = String(value).trim();
  if (!normalized) return true;
  return /^(change|replace|your_|example|dummy|placeholder|demo|dev)/i.test(normalized)
    || normalized.includes('replace_with_')
    || normalized.includes('your_')
    || normalized.includes('example.com')
    || normalized.includes('your_google')
    || normalized.includes('your_cloud')
    || normalized.includes('your_email');
};

const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const keysToValidate = isProduction ? requiredProductionEnvKeys : requiredEnvKeys;

  for (const key of keysToValidate) {
    const value = process.env[key];
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      if (!isProduction && devDefaults[key]) {
        process.env[key] = devDefaults[key];
        continue;
      }
      throw new Error(`Missing required env: ${key}`);
    }

    if (isPlaceholderValue(normalized)) {
      if (!isProduction && devDefaults[key]) {
        process.env[key] = devDefaults[key];
        continue;
      }
      throw new Error(`Placeholder value detected for ${key}`);
    }

    if ((key.includes('SECRET') || key.includes('PASS') || key.includes('KEY')) && normalized.length < 16) {
      if (!isProduction && devDefaults[key]) {
        process.env[key] = devDefaults[key];
        continue;
      }
      throw new Error(`${key} is too short`);
    }
  }

  if (!isProduction && (!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim())) {
    console.warn('Email is not configured. OTP and notification emails will not be delivered until EMAIL_USER and EMAIL_PASS are set.');
  }
};

validateEnvironment();
connectDB();

const app = express();
app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https://accounts.google.com'],
    },
  },
}));

const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const isVercelPreviewOrigin = /^https:\/\/my-eshop-125-[a-z0-9-]+-saud7\.vercel\.app$/i.test(cleanOrigin);
    if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin) || isVercelPreviewOrigin) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/', generalLimiter);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Store API is running.', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Store API is running.', env: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/pages', contentPageRoutes);
app.use('/api/offers', offerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

export default app;
