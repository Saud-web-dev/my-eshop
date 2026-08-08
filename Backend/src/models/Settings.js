import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // ── Store Info ──────────────────────────────────────────────────────────
    storeName:           { type: String, default: '' },
    businessName:        { type: String },
    businessDescription: { type: String },
    logo:    { url: String, publicId: String },
    favicon: { url: String, publicId: String },

    // ── Homepage Content ────────────────────────────────────────────────────
    heroImages:   [{ url: String, publicId: String, alt: String, link: String }],
    bannerImages: [{ url: String, publicId: String, alt: String, link: String }],
    heroTitle:          { type: String },
    heroBadge:          { type: String },
    heroSubtitle:       { type: String },
    heroCtaLabel:       { type: String },
    heroSecondaryLabel: { type: String },
    featuredSectionTitle: { type: String },
    featuredSectionBadge: { type: String },
    newArrivalsTitle:   { type: String },
    newArrivalsBadge:   { type: String },
    newArrivalsDesc:    { type: String },
    newArrivalsCtaLabel:{ type: String },
    aboutSectionTitle:  { type: String },
    aboutSectionBadge:  { type: String },
    aboutSectionSubtitle:{ type: String },
    aboutHeroTitle:     { type: String },
    aboutHeroSubtitle:  { type: String },
    aboutImage:         { url: String, publicId: String },
    aboutPromiseTitle:  { type: String },
    aboutPromiseDesc:   { type: String },
    aboutStats:         [{ value: String, label: String }],
    // Homepage features bar (array of { title, desc })
    features: [{ title: String, desc: String }],

    // ── Contact ─────────────────────────────────────────────────────────────
    email:    { type: String },
    phone:    { type: String },
    whatsapp: { type: String },
    website:  { type: String },
    address:  { type: String },
    city:     { type: String },
    country:  { type: String, default: 'Pakistan' },

    // ── Social ──────────────────────────────────────────────────────────────
    facebook:  String,
    instagram: String,
    linkedin:  String,
    twitter:   String,
    youtube:   String,
    tiktok:    String,

    // ── Business Hours ──────────────────────────────────────────────────────
    businessHours: {
      monday:    { open: String, close: String, isClosed: Boolean },
      tuesday:   { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday:  { open: String, close: String, isClosed: Boolean },
      friday:    { open: String, close: String, isClosed: Boolean },
      saturday:  { open: String, close: String, isClosed: Boolean },
      sunday:    { open: String, close: String, isClosed: Boolean },
    },

    // ── Regional ────────────────────────────────────────────────────────────
    currency:       { type: String, default: 'PKR' },
    currencySymbol: { type: String, default: '₨' },
    timezone:       { type: String, default: 'Asia/Karachi' },

    // ── Shipping ────────────────────────────────────────────────────────────
    freeShippingThreshold: { type: Number, default: 0 },
    defaultShippingCost:   { type: Number, default: 0 },
    shippingZones: [{
      name: String, cost: Number, cities: [String], estimatedDays: String,
    }],

    // ── Tax ─────────────────────────────────────────────────────────────────
    taxRate:     { type: Number, default: 0 },
    taxIncluded: { type: Boolean, default: false },

    // ── Theme ────────────────────────────────────────────────────────────────
    theme: {
      mode:          { type: String, enum: ['light', 'dark'], default: 'light' },
      primaryColor:  { type: String, default: '#1a1a2e' },
      secondaryColor:{ type: String, default: '#16213e' },
      accentColor:   { type: String, default: '#e94560' },
      fontFamily:    { type: String, default: 'Inter' },
      borderRadius:  { type: String, default: 'md' },
      buttonStyle:   { type: String, default: 'rounded' },
      cardStyle:     { type: String, default: 'shadow' },
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    metaTitle:        String,
    metaDescription:  String,
    metaKeywords:     [String],
    googleAnalyticsId:String,
    facebookPixelId:  String,

    // ── Policies / CMS ───────────────────────────────────────────────────────
    termsAndConditions: String,
    privacyPolicy:      String,
    refundPolicy:       String,
    aboutUs:            String,

    // ── Footer ───────────────────────────────────────────────────────────────
    footerTagline: String,
    footerLinks:   [{ label: String, url: String }],

    // ── Notifications ─────────────────────────────────────────────────────────
    orderConfirmationEmail: { type: Boolean, default: true },
    shippingUpdateEmail:    { type: Boolean, default: true },
    lowStockAlert:          { type: Boolean, default: true },
    lowStockThreshold:      { type: Number, default: 5 },

    // ── Setup ────────────────────────────────────────────────────────────────
    setupCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
