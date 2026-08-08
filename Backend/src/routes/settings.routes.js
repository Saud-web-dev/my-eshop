import { Router } from 'express';
import {
  getSettings, updateSettings, uploadLogo,
  uploadBanner, uploadHeroImage, deleteHeroImage, uploadAboutImage, completeSetup,
  sendContactMessage,
} from '../controllers/settings.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { settingsUpload } from '../middleware/multer.js';

const router = Router();

// Public — frontend reads for theming & meta
router.get('/', getSettings);
router.post('/contact', sendContactMessage);

// Admin only
router.use(protect, authorize('admin'));
router.put('/',                                              updateSettings);
router.post('/logo',        settingsUpload.single('logo'),   uploadLogo);
router.post('/banners',     settingsUpload.array('banners', 10), uploadBanner);
router.post('/hero',        settingsUpload.single('image'),  uploadHeroImage);
router.delete('/hero/:publicId',                             deleteHeroImage);
router.post('/about-image', settingsUpload.single('image'),  uploadAboutImage);
router.post('/setup',                                        completeSetup);

export default router;
