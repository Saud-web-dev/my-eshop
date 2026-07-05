import multer from "multer";
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync('./uploads', { recursive: true });
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file, 'filename');
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// ✅ Sirf images allow karo
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sirf images allowed hain! (jpg, jpeg, png, webp)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter 
});

export default upload;