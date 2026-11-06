import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

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

const createCloudinaryStorage = (folder) => ({
  _handleFile(req, file, callback) {
    const publicId = `${Date.now()}-${path.parse(file.originalname).name.replace(/\s+/g, '-')}`;
    let completed = false;
    const finish = (error, fileInfo) => {
      if (completed) return;
      completed = true;
      callback(error, fileInfo);
    };

    const uploadStream = cloudinary.uploader.upload_stream({
      folder: `store/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      public_id: publicId,
    }, (error, result) => {
      if (error) return finish(error);
      finish(null, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes,
      });
    });

    uploadStream.on('error', finish);
    file.stream.on('error', finish);
    file.stream.pipe(uploadStream);
  },
  _removeFile(req, file, callback) {
    cloudinary.uploader.destroy(file.filename, (error) => {
      if (error) return callback(error);
      delete file.path;
      delete file.filename;
      delete file.size;
      callback(null);
    });
  },
});

export const getPublicUploadUrl = (req, file) => {
  if (/^https?:\/\//i.test(file.path)) return file.path;

  const uploadsRoot = path.join(process.cwd(), 'uploads');
  const relativePath = path.relative(uploadsRoot, file.path);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Uploaded file is outside the public uploads directory.');
  }

  const encodedPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');
  return `${req.protocol}://${req.get('host')}/uploads/${encodedPath}`;
};

// ── Factory: returns a multer instance for the given folder ──────────────────
const makeUpload = (folder, maxSize = 5 * 1024 * 1024, maxCount = null) => {
  let storage;

  if (CLOUDINARY_READY) {
    storage = createCloudinaryStorage(folder);
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
