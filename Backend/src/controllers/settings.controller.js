import Settings from '../models/Settings.js';
import cloudinary from '../config/cloudinary.js';
import { sendContactEmail } from '../services/emailService.js';
import { getPublicUploadUrl } from '../middleware/multer.js';

// ─── SEND CONTACT MESSAGE (public) ───────────────────────────────────────────
export const sendContactMessage = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const subject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!name || !email || !subject || !message)
      return res.status(400).json({ success: false, message: 'Name, email, subject and message are required.' });
    if (name.length > 120 || subject.length > 200 || message.length > 5000
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter valid contact details and keep the message under 5000 characters.' });
    }

    const settings = await Settings.findOne();
    const recipient = settings?.email?.trim() || process.env.CONTACT_EMAIL?.trim() || process.env.EMAIL_USER?.trim();
    if (!recipient) {
      console.error('Contact form email could not be sent: no recipient is configured.');
      return res.status(503).json({ success: false, message: 'The store email is not configured. Please contact the store by phone.' });
    }

    const result = await sendContactEmail({
      name,
      email,
      subject,
      message,
      storeName: settings?.storeName || 'Your Store',
      to: recipient,
    });

    if (!result.success) {
      console.error('Contact form email delivery failed:', result.error || 'Unknown email error');
      return res.status(503).json({ success: false, message: 'We could not deliver your message by email. Please try again later or contact the store by phone.' });
    }

    res.status(200).json({ success: true, message: 'Your message has been sent. We will get back to you soon!' });
  } catch (error) {
    console.error('Contact form submission failed:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SETTINGS ────────────────────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE SETTINGS ─────────────────────────────────────────────────────────
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    // Deep merge req.body
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key]) && req.body[key] !== null) {
        settings[key] = { ...(settings[key] || {}), ...req.body[key] };
      } else {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Settings updated.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── UPLOAD LOGO ─────────────────────────────────────────────────────────────
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    // Delete old logo from Cloudinary
    if (settings.logo?.publicId) {
      await cloudinary.uploader.destroy(settings.logo.publicId).catch(() => {});
    }

    settings.logo = { url: getPublicUploadUrl(req, req.file), publicId: req.file.filename };
    await settings.save();
    res.status(200).json({ success: true, data: settings.logo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPLOAD HERO IMAGE ────────────────────────────────────────────────────────
export const uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const newImage = {
      url: getPublicUploadUrl(req, req.file),
      publicId: req.file.filename,
      alt: req.body.alt || '',
      link: req.body.link || '',
    };

    settings.heroImages = [...(settings.heroImages || []), newImage];
    await settings.save();
    res.status(200).json({ success: true, data: settings.heroImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE HERO IMAGE ────────────────────────────────────────────────────────
export const deleteHeroImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const decoded = decodeURIComponent(publicId);

    let settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found.' });

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(decoded).catch(() => {});

    settings.heroImages = (settings.heroImages || []).filter(img => img.publicId !== decoded);
    await settings.save();
    res.status(200).json({ success: true, data: settings.heroImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPLOAD BANNER ───────────────────────────────────────────────────────────
export const uploadBanner = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded.' });

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const newBanners = req.files.map(f => ({ url: getPublicUploadUrl(req, f), publicId: f.filename, alt: '' }));
    settings.bannerImages = [...(settings.bannerImages || []), ...newBanners];
    await settings.save();
    res.status(200).json({ success: true, data: settings.bannerImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPLOAD ABOUT IMAGE (Second Picture) ──────────────────────────────────
export const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (settings.aboutImage?.publicId) {
      await cloudinary.uploader.destroy(settings.aboutImage.publicId).catch(() => {});
    }

    settings.aboutImage = { url: getPublicUploadUrl(req, req.file), publicId: req.file.filename };
    await settings.save();
    res.status(200).json({ success: true, data: settings.aboutImage, message: 'About image updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── COMPLETE SETUP WIZARD ───────────────────────────────────────────────────
export const completeSetup = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    Object.assign(settings, req.body);
    settings.setupCompleted = true;
    await settings.save();

    res.status(200).json({ success: true, message: 'Store setup completed!', data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
