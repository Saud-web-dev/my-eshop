import FAQ from '../models/FAQ.js';

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAllFaqs = async (req, res) => {
  try {
    const { includeInactive = 'false', category } = req.query;
    const filter = {};
    if (includeInactive !== 'true') filter.isActive = true;
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createFaq = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.status(200).json({ success: true, message: 'FAQ deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
