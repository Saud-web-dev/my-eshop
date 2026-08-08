import Settings from '../models/Settings.js';
import cloudinary from '../config/cloudinary.js';
import { sendContactEmail } from '../services/emailService.js';

// ─── SEND CONTACT MESSAGE (public) ───────────────────────────────────────────
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });

    const settings = await Settings.findOne();

    const result = await sendContactEmail({
      name,
      email,
      subject,
      message,
      storeName: settings?.storeName || 'Your Store',
      to: settings?.email,
    });

    if (!result.success)
      return res.status(500).json({ success: false, message: 'Email service is not configured. Please contact the store directly.' });

    res.status(200).json({ success: true, message: 'Your message has been sent. We will get back to you soon!' });
  } catch (error) {
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

    settings.logo = { url: req.file.path, publicId: req.file.filename };
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
      url: req.file.path,
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

    const newBanners = req.files.map(f => ({ url: f.path, publicId: f.filename, alt: '' }));
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

    settings.aboutImage = { url: req.file.path, publicId: req.file.filename };
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
