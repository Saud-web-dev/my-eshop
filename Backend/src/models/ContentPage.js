import mongoose from 'mongoose';

const contentPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Page slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: [true, 'Page title is required'], trim: true },
    content: { type: String, default: '' },
    // Optional hero/banner image
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
  },
  { timestamps: true }
);

// slug already has unique:true — no separate index needed


const ContentPage = mongoose.model('ContentPage', contentPageSchema);
export default ContentPage;
