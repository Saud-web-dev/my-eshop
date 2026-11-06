import ContentPage from '../models/ContentPage.js';
import cloudinary from '../config/cloudinary.js';

const PAGE_SLUGS = new Set([
  'contact', 'faq', 'track-order', 'shipping',
  'returns', 'refund-policy', 'privacy-policy', 'terms',
]);

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAllPages = async (req, res) => {
  try {
    const { includeInactive = 'false' } = req.query;
    const filter = {};
    if (includeInactive !== 'true') filter.isActive = true;

    const pages = await ContentPage.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE (by slug or id) ──────────────────────────────────────────────
export const getPage = async (req, res) => {
  try {
    const query = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.slug }
      : { slug: req.params.slug };
    const page = await ContentPage.findOne(query);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    res.status(200).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createPage = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = { url: req.file.path, publicId: req.file.filename };
    }
    // Normalize slug
    if (data.slug) {
      data.slug = data.slug.toLowerCase().trim().replace(/\s+/g, '-');
    }
    if (!PAGE_SLUGS.has(data.slug)) {
      return res.status(400).json({
        success: false,
        message: `Invalid page slug. Allowed slugs: ${[...PAGE_SLUGS].join(', ')}`,
      });
    }
    const page = await ContentPage.create(data);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Page slug already exists.' });
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updatePage = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const existing = await ContentPage.findById(req.params.id);
      if (existing?.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId);
      }
      data.image = { url: req.file.path, publicId: req.file.filename };
    }
    const page = await ContentPage.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    res.status(200).json({ success: true, data: page });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deletePage = async (req, res) => {
  try {
    const page = await ContentPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    if (page.image?.publicId) {
      await cloudinary.uploader.destroy(page.image.publicId);
    }
    await page.deleteOne();
    res.status(200).json({ success: true, message: 'Page deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
