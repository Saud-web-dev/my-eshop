import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { settingsAPI } from '@services/api';
import { getErrorMessage } from '@utils/helpers';
import { useTheme } from '@contexts/ThemeContext';
import Input, { Textarea, Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import ImageUpload from '@components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { MdStore, MdPalette, MdContactMail, MdShare, MdSecurity, MdLocalShipping, MdHome, MdDelete } from 'react-icons/md';

const Settings = () => {
  const [tab, setTab]     = useState('general');
  const [form, setForm]   = useState({});
  const [logo, setLogo]   = useState([]);
  const [heroFile, setHeroFile] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const { updateTheme, loadSettings } = useTheme();
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getSettings(),
    select: d => d.data.data,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (path, val) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: () => settingsAPI.updateSettings(form),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      await loadSettings();
      toast.success('Settings saved!');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const logoMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('logo', logo[0]);
      return settingsAPI.uploadLogo(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['settings']); toast.success('Logo updated!'); setLogo([]); loadSettings(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteHeroMutation = useMutation({
    mutationFn: (publicId) => settingsAPI.deleteHeroImage(publicId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); loadSettings(); toast.success('Image removed.'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const uploadHero = async () => {
    if (!heroFile) return;
    setHeroUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', heroFile);
      await settingsAPI.uploadHeroImage(fd);
      qc.invalidateQueries({ queryKey: ['settings'] });
      await loadSettings();
      setHeroFile(null);
      toast.success('Hero image uploaded!');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setHeroUploading(false);
    }
  };

  const f = form;

  const [aboutFile, setAboutFile] = useState(null);
  const [aboutUploading, setAboutUploading] = useState(false);

  const uploadAboutImg = async () => {
    if (!aboutFile) return;
    setAboutUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', aboutFile);
      await settingsAPI.uploadAboutImage(fd);
      qc.invalidateQueries({ queryKey: ['settings'] });
      await loadSettings();
      setAboutFile(null);
      toast.success('About image uploaded!');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAboutUploading(false);
    }
  };

  const TABS = [
    { id: 'general',  label: 'General',  icon: <MdStore size={16} /> },
    { id: 'homepage', label: 'Homepage', icon: <MdHome size={16} /> },
    { id: 'aboutpage',label: 'About Page', icon: <MdHome size={16} /> },
    { id: 'contact',  label: 'Contact',  icon: <MdContactMail size={16} /> },
    { id: 'social',   label: 'Social',   icon: <MdShare size={16} /> },
    { id: 'theme',    label: 'Theme',    icon: <MdPalette size={16} /> },
    { id: 'shipping', label: 'Shipping', icon: <MdLocalShipping size={16} /> },
    { id: 'policies', label: 'Policies', icon: <MdSecurity size={16} /> },
  ];

  return (
    <>
      <Helmet><title>Settings – Admin</title></Helmet>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-text-primary">Store Settings</h1>

        <div className="flex gap-6">
          {/* Tab sidebar */}
          <nav className="w-48 shrink-0 space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  tab === t.id ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-overlay'
                }`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="flex-1 bg-surface border border-border rounded-card p-6 space-y-6">
            {tab === 'general' && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-text-primary">Store Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Store Name" value={f.storeName || ''} onChange={e => set('storeName', e.target.value)} />
                    <Input label="Business Name" value={f.businessName || ''} onChange={e => set('businessName', e.target.value)} />
                  </div>
                  <Textarea label="Business Description" rows={3}
                    value={f.businessDescription || ''} onChange={e => set('businessDescription', e.target.value)} />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Currency" value={f.currency || 'PKR'} onChange={e => set('currency', e.target.value)} />
                    <Input label="Currency Symbol" value={f.currencySymbol || '₨'} onChange={e => set('currencySymbol', e.target.value)} />
                    <Input label="Country" value={f.country || 'Pakistan'} onChange={e => set('country', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">Logo</h3>
                  {settings?.logo?.url && (
                    <img src={settings.logo.url} alt="Logo" className="h-14 w-auto border border-border rounded-lg p-1" />
                  )}
                  <ImageUpload label="Upload New Logo" value={logo} onChange={setLogo} maxFiles={1} />
                  {logo.length > 0 && (
                    <Button onClick={() => logoMutation.mutate()} loading={logoMutation.isPending} size="sm">
                      Upload Logo
                    </Button>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">SEO</h3>
                  <Input label="Meta Title" value={f.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} />
                  <Textarea label="Meta Description" rows={2} value={f.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} />
                  <Input label="Google Analytics ID" value={f.googleAnalyticsId || ''} onChange={e => set('googleAnalyticsId', e.target.value)} />
                  <Input label="Facebook Pixel ID" value={f.facebookPixelId || ''} onChange={e => set('facebookPixelId', e.target.value)} />
                </div>
              </>
            )}

            {tab === 'homepage' && (
              <div className="space-y-6">
                {/* Hero Images Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-text-primary">Hero Background Images</h3>
                  {/* Existing hero images */}
                  {settings?.heroImages?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {settings.heroImages.map((img, i) => (
                        <div key={i} className="relative group w-40 h-24 rounded-lg overflow-hidden border border-border">
                          <img src={img.url} alt={img.alt || `Hero ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => img.publicId && deleteHeroMutation.mutate(img.publicId)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image">
                            <MdDelete size={12} />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 bg-accent/90 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">HERO</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload new hero image */}
                  <div className="flex items-center gap-3">
                    <label className="btn-outline text-sm cursor-pointer">
                      {heroFile ? 'Change Image' : 'Choose Hero Image'}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => setHeroFile(e.target.files[0] || null)} />
                    </label>
                    {heroFile && (
                      <>
                        <img src={URL.createObjectURL(heroFile)} alt="preview"
                          className="h-12 w-20 object-cover rounded border border-border" />
                        <Button onClick={uploadHero} loading={heroUploading} size="sm">Upload</Button>
                        <button onClick={() => setHeroFile(null)} className="text-xs text-text-muted hover:text-red-500">Cancel</button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">Upload a full-width banner image for the homepage hero section. Recommended: 1920×800px.</p>
                </div>

                {/* Hero Text */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">Hero Section Text</h3>
                  <Input label="Hero Title" placeholder="e.g. Shop Premium Quality" value={f.heroTitle || ''} onChange={e => set('heroTitle', e.target.value)} />
                  <Input label="Badge (above title)" placeholder="e.g. New Collection" value={f.heroBadge || ''} onChange={e => set('heroBadge', e.target.value)} />
                  <Textarea label="Subtitle" rows={2} placeholder="Short tagline below title" value={f.heroSubtitle || ''} onChange={e => set('heroSubtitle', e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Primary CTA Button" placeholder="Shop Now" value={f.heroCtaLabel || ''} onChange={e => set('heroCtaLabel', e.target.value)} />
                    <Input label="Secondary Link Text" placeholder="Learn More" value={f.heroSecondaryLabel || ''} onChange={e => set('heroSecondaryLabel', e.target.value)} />
                  </div>
                </div>

                {/* Featured Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">Featured Products Section</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Section Badge" placeholder="e.g. Handpicked" value={f.featuredSectionBadge || ''} onChange={e => set('featuredSectionBadge', e.target.value)} />
                    <Input label="Section Title" placeholder="Featured Products" value={f.featuredSectionTitle || ''} onChange={e => set('featuredSectionTitle', e.target.value)} />
                  </div>
                </div>

                {/* New Arrivals */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">New Arrivals Section</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Badge" placeholder="Just Arrived" value={f.newArrivalsBadge || ''} onChange={e => set('newArrivalsBadge', e.target.value)} />
                    <Input label="Title" placeholder="New Arrivals" value={f.newArrivalsTitle || ''} onChange={e => set('newArrivalsTitle', e.target.value)} />
                    <Input label="Description" value={f.newArrivalsDesc || ''} onChange={e => set('newArrivalsDesc', e.target.value)} />
                    <Input label="CTA Button Text" placeholder="Shop New Arrivals" value={f.newArrivalsCtaLabel || ''} onChange={e => set('newArrivalsCtaLabel', e.target.value)} />
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">About Section</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Section Badge" placeholder="Our Story" value={f.aboutSectionBadge || ''} onChange={e => set('aboutSectionBadge', e.target.value)} />
                    <Input label="Section Title" placeholder="About Us" value={f.aboutSectionTitle || ''} onChange={e => set('aboutSectionTitle', e.target.value)} />
                  </div>
                  <Textarea label="About Us Text" rows={5} value={f.aboutUs || ''} onChange={e => set('aboutUs', e.target.value)} />
                </div>
              </div>
            )}

            {tab === 'aboutpage' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-text-primary">About Page Hero Header</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Page Title" placeholder="e.g. About Zahoor Fragrance" value={f.aboutHeroTitle || ''} onChange={e => set('aboutHeroTitle', e.target.value)} />
                    <Input label="Badge / Label" placeholder="e.g. Our Story" value={f.aboutSectionBadge || ''} onChange={e => set('aboutSectionBadge', e.target.value)} />
                  </div>
                  <Textarea label="Hero Tagline / Subtitle" rows={2} placeholder="e.g. Crafting unforgettable scent journeys, one fragrance at a time." value={f.aboutHeroSubtitle || ''} onChange={e => set('aboutHeroSubtitle', e.target.value)} />
                </div>

                {/* About Story & Second Picture */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">Main Story &amp; Image</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Section Title" placeholder="e.g. About Our Brand" value={f.aboutSectionTitle || ''} onChange={e => set('aboutSectionTitle', e.target.value)} />
                    <Input label="Story Subtitle" placeholder="e.g. A Passion for Excellence &amp; Quality" value={f.aboutSectionSubtitle || ''} onChange={e => set('aboutSectionSubtitle', e.target.value)} />
                  </div>
                  <Textarea label="Full Story Text" rows={6} placeholder="Write your brand story here…" value={f.aboutUs || ''} onChange={e => set('aboutUs', e.target.value)} />

                  {/* Second Picture upload */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Second Picture (About Section Feature Image)</label>
                    <div className="flex items-center gap-4">
                      {settings?.aboutImage?.url ? (
                        <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                          <img src={settings.aboutImage.url} alt="About Section" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-32 h-24 rounded-lg bg-surface-overlay flex items-center justify-center text-xs text-text-muted">No Image</div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="btn-outline text-sm cursor-pointer">
                            {aboutFile ? 'Change File' : 'Choose Picture'}
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => setAboutFile(e.target.files[0] || null)} />
                          </label>
                          {aboutFile && (
                            <>
                              <img src={URL.createObjectURL(aboutFile)} alt="preview" className="h-10 w-14 object-cover rounded border border-border" />
                              <Button onClick={uploadAboutImg} loading={aboutUploading} size="sm">Upload</Button>
                              <button onClick={() => setAboutFile(null)} className="text-xs text-text-muted hover:text-red-500">Cancel</button>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">Upload the second image displayed next to your brand story on the About page.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promise Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-text-primary">Our Promise Section</h3>
                  <Input label="Promise Title" placeholder="e.g. Our Promise to You" value={f.aboutPromiseTitle || ''} onChange={e => set('aboutPromiseTitle', e.target.value)} />
                  <Textarea label="Promise Description" rows={3} placeholder="e.g. Every product is authentic and handled with care..." value={f.aboutPromiseDesc || ''} onChange={e => set('aboutPromiseDesc', e.target.value)} />
                </div>
              </div>
            )}

            {tab === 'contact' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" type="email" value={f.email || ''} onChange={e => set('email', e.target.value)} />
                  <Input label="Phone" type="tel" value={f.phone || ''} onChange={e => set('phone', e.target.value)} />
                  <Input label="WhatsApp" type="tel" value={f.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} />
                  <Input label="Website" type="url" value={f.website || ''} onChange={e => set('website', e.target.value)} />
                </div>
                <Textarea label="Address" rows={2} value={f.address || ''} onChange={e => set('address', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={f.city || ''} onChange={e => set('city', e.target.value)} />
                  <Input label="Country" value={f.country || ''} onChange={e => set('country', e.target.value)} />
                </div>
              </div>
            )}

            {tab === 'social' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Social Media Links</h3>
                {[
                  { key: 'facebook', label: 'Facebook URL' },
                  { key: 'instagram', label: 'Instagram URL' },
                  { key: 'twitter', label: 'Twitter URL' },
                  { key: 'youtube', label: 'YouTube URL' },
                  { key: 'tiktok', label: 'TikTok URL' },
                  { key: 'linkedin', label: 'LinkedIn URL' },
                ].map(s => (
                  <Input key={s.key} label={s.label} type="url"
                    value={f[s.key] || ''} onChange={e => set(s.key, e.target.value)} />
                ))}
              </div>
            )}

            {tab === 'theme' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-text-primary">Theme Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={f.theme?.accentColor || '#e94560'}
                        onChange={e => { set('theme.accentColor', e.target.value); updateTheme({ accentColor: e.target.value }); }}
                        className="w-12 h-10 rounded cursor-pointer border border-border" />
                      <span className="text-sm text-text-muted">{f.theme?.accentColor || '#e94560'}</span>
                    </div>
                  </div>
                  <Select label="Dark Mode" value={f.theme?.mode || 'light'}
                    onChange={e => { set('theme.mode', e.target.value); updateTheme({ mode: e.target.value }); }}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </Select>
                  <Select label="Border Radius" value={f.theme?.borderRadius || 'md'}
                    onChange={e => { set('theme.borderRadius', e.target.value); updateTheme({ borderRadius: e.target.value }); }}>
                    {['sm','md','lg','xl','full'].map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                  <Select label="Font Family" value={f.theme?.fontFamily || 'Inter'}
                    onChange={e => { set('theme.fontFamily', e.target.value); updateTheme({ fontFamily: e.target.value }); }}>
                    {['Inter','Roboto','Lato','Poppins','Montserrat','Open Sans'].map(f => <option key={f} value={f}>{f}</option>)}
                  </Select>
                </div>
              </div>
            )}

            {tab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Shipping Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Default Shipping Cost (₨)" type="number"
                    value={f.defaultShippingCost || 0} onChange={e => set('defaultShippingCost', e.target.value)} />
                  <Input label="Free Shipping Threshold (₨)" type="number"
                    value={f.freeShippingThreshold || 0} onChange={e => set('freeShippingThreshold', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Tax Rate (%)" type="number" step="0.01"
                    value={f.taxRate || 0} onChange={e => set('taxRate', e.target.value)} />
                  <label className="flex items-center gap-3 cursor-pointer mt-7">
                    <input type="checkbox" checked={!!f.taxIncluded} onChange={e => set('taxIncluded', e.target.checked)}
                      className="accent-accent w-4 h-4" />
                    <span className="text-sm text-text-secondary">Tax included in prices</span>
                  </label>
                </div>
              </div>
            )}

            {tab === 'policies' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Store Policies</h3>
                <Textarea label="Terms & Conditions" rows={6}
                  value={f.termsAndConditions || ''} onChange={e => set('termsAndConditions', e.target.value)} />
                <Textarea label="Privacy Policy" rows={6}
                  value={f.privacyPolicy || ''} onChange={e => set('privacyPolicy', e.target.value)} />
                <Textarea label="Refund Policy" rows={4}
                  value={f.refundPolicy || ''} onChange={e => set('refundPolicy', e.target.value)} />
                <Textarea label="About Us" rows={6}
                  value={f.aboutUs || ''} onChange={e => set('aboutUs', e.target.value)} />
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
