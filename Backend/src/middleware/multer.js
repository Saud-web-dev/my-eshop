import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

/**
 * We use a TWO-STEP approach:
 *  1. multer stores the file on disk (temp)
 *  2. After upload, a middleware uploads to Cloudinary and removes the temp file
 *
 * This avoids CloudinaryStorage crashing at module load time when env vars are missing.
 * If Cloudinary IS configured, we use CloudinaryStorage directly for better performance.
 */

const CLOUDINARY_READY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed.'), false);
};

// ── Factory: returns a multer instance for the given folder ──────────────────
const makeUpload = (folder, maxSize = 5 * 1024 * 1024, maxCount = null) => {
  let storage;

  if (CLOUDINARY_READY) {
    // Direct Cloudinary upload (production-ready)
    storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: `store/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        public_id: `${Date.now()}-${path.parse(file.originalname).name.replace(/\s+/g, '-')}`,
      }),
    });
  } else {
    // Fallback: local disk storage when Cloudinary is not configured
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    });
  }

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: imageFilter,
  });
};

// ── Exported upload instances ────────────────────────────────────────────────
export const productUpload  = makeUpload('products',   5 * 1024 * 1024);
export const categoryUpload = makeUpload('categories', 2 * 1024 * 1024);
export const avatarUpload   = makeUpload('avatars',    2 * 1024 * 1024);
export const settingsUpload = makeUpload('settings',   5 * 1024 * 1024);
export const reviewUpload   = makeUpload('reviews',    3 * 1024 * 1024);

// ── After-upload cleanup: remove disk file if it was uploaded to Cloudinary ──
// This runs as an additional middleware ONLY when using disk fallback + you later
// manually push to Cloudinary. Currently not needed since CloudinaryStorage handles it.
export const cleanupLocalFile = (req, res, next) => {
  // Files uploaded via CloudinaryStorage already have req.file.path = CDN URL
  // Files uploaded via diskStorage have req.file.path = local disk path
  // We can detect which by checking if path starts with 'http'
  const files = req.files || (req.file ? [req.file] : []);
  files.forEach(f => {
    if (f.path && !f.path.startsWith('http') && fs.existsSync(f.path)) {
      fs.unlink(f.path, (err) => {
        if (err) console.error('Failed to delete temp file:', f.path, err.message);
      });
    }
  });
  next();
};
