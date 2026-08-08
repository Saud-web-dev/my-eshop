import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@contexts/ThemeContext';
import {
  MdLocalShipping, MdVerified, MdHeadset, MdRefresh,
  MdEmail, MdPhone, MdLocationOn, MdAutoAwesome,
} from 'react-icons/md';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaWhatsapp,
} from 'react-icons/fa';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const DEFAULT_FEATURES = [
  { icon: <MdLocalShipping size={28} />, title: 'Fast Delivery', desc: 'Quick & reliable shipping across Pakistan' },
  { icon: <MdVerified size={28} />, title: '100% Authentic', desc: 'All fragrances are original and verified' },
  { icon: <MdHeadset size={28} />, title: '24/7 Support', desc: 'We are always here to help you' },
  { icon: <MdRefresh size={28} />, title: 'Easy Returns', desc: 'Hassle-free return & exchange policy' },
];

const DEFAULT_STATS = [
  { value: '500+', label: 'Premium Fragrances' },
  { value: '10k+', label: 'Happy Customers' },
  { value: '100%', label: 'Authentic Products' },
  { value: '24/7', label: 'Customer Support' },
];

const About = () => {
  const { storeSettings } = useTheme();
  const s = storeSettings || {};
  const storeName = s.storeName || 'Our Store';
  const aboutText = s.aboutUs || '';
  const features = s.features?.length ? s.features : null;
  const stats = s.aboutStats?.length ? s.aboutStats : DEFAULT_STATS;

  // Second image determined by admin in settings.aboutImage, with fallbacks
  const secondPicture = s.aboutImage?.url || s.heroImages?.[0]?.url || s.logo?.url;

  const socials = [
    { icon: <FaFacebook />, href: s.facebook, label: 'Facebook', color: '#1877f2' },
    { icon: <FaInstagram />, href: s.instagram, label: 'Instagram', color: '#e1306c' },
    { icon: <FaTwitter />, href: s.twitter, label: 'Twitter', color: '#1da1f2' },
    { icon: <FaYoutube />, href: s.youtube, label: 'YouTube', color: '#ff0000' },
    { icon: <FaTiktok />, href: s.tiktok, label: 'TikTok', color: '#000000' },
    { icon: <FaWhatsapp />, href: s.whatsapp ? `https://wa.me/${s.whatsapp}` : null, label: 'WhatsApp', color: '#25d366' },
  ].filter(x => x.href);

  return (
    <>
      <Helmet>
        <title>About Us – {storeName}</title>
        <meta name="description" content={aboutText.slice(0, 160) || `Learn about ${storeName}`} />
      </Helmet>

      {/* ── Hero Banner ── */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-primary-900">
        {s.heroImages?.[0]?.url && (
          <img
            src={s.heroImages[0].url}
            alt={storeName}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-900/95 to-accent/20" />
        <div className="relative container-custom text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {s.logo?.url ? (
              <motion.img
                variants={fadeUp}
                src={s.logo.url}
                alt={storeName}
                className="h-20 w-auto mx-auto mb-6 drop-shadow-lg"
              />
            ) : (
              <motion.div
                variants={fadeUp}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center"
              >
                <MdAutoAwesome size={36} className="text-accent" />
              </motion.div>
            )}
            <motion.p variants={fadeUp} className="text-accent font-medium uppercase tracking-widest text-sm mb-3">
              {s.aboutSectionBadge || 'Our Story'}
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {s.aboutHeroTitle || s.aboutSectionTitle || `About ${storeName}`}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-primary-300 text-lg max-w-2xl mx-auto">
              {s.aboutHeroSubtitle || 'Crafting quality products with elegance and dedication.'}
            </motion.p>
            <motion.div variants={fadeUp} className="w-20 h-1 bg-accent mx-auto rounded-full mt-6" />
          </motion.div>
        </div>
      </section>

      {/* ── Story / About Text ── */}
      <section className="py-16 md:py-20 bg-surface-raised">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <p className="text-accent text-sm font-medium uppercase tracking-widest mb-3">
                {s.aboutSectionBadge || 'Our Story'}
              </p>
              <h2 className="section-title mb-5">
                {s.aboutSectionSubtitle || 'A Passion for Excellence & Quality'}
              </h2>
              {aboutText ? (
                <div
                  className="text-text-secondary leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: aboutText.replace(/\n/g, '<br />') }}
                />
              ) : (
                <p className="text-text-secondary leading-relaxed">
                  {storeName} was founded with a passion for delivering premium quality products and
                  unmatched customer experience. Every item in our collection is curated to bring you
                  the finest standards of elegance and authenticity.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
                {stats.map((st, i) => (
                  <motion.div
                    key={st.label + i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="text-center"
                  >
                    <p className="font-heading text-2xl md:text-3xl font-bold text-accent">{st.value}</p>
                    <p className="text-xs text-text-muted mt-1">{st.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Second Picture Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/10 rounded-3xl rotate-3" />
                {secondPicture ? (
                  <img
                    src={secondPicture}
                    alt={storeName}
                    className="relative rounded-3xl shadow-card-hover w-full h-[380px] object-cover"
                  />
                ) : (
                  <div className="relative rounded-3xl bg-primary-900 w-full h-[380px] flex items-center justify-center overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/20 blur-2xl" />
                    <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-500/20 blur-2xl" />
                    <MdAutoAwesome size={96} className="text-accent/60 relative" />
                  </div>
                )}
                <div className="absolute bottom-6 left-6 bg-surface/95 backdrop-blur border border-border rounded-2xl px-5 py-4 shadow-card-hover">
                  <p className="font-heading text-2xl font-bold text-accent">{storeName}</p>
                  <p className="text-xs text-text-muted">Trusted quality across Pakistan</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-accent text-sm font-medium uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="section-title">What Makes Us Special</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(features || DEFAULT_FEATURES).map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  {typeof f.icon === 'string' ? (
                    <span className="text-2xl">{f.icon}</span>
                  ) : (
                    f.icon || <MdVerified size={28} />
                  )}
                </div>
                <h3 className="font-bold text-text-primary mb-2">{f.title}</h3>
                {f.desc && <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission Strip ── */}
      <section className="py-14 bg-primary-900 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <MdVerified size={40} className="text-accent mx-auto mb-4" />
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-4">
              {s.aboutPromiseTitle || 'Our Promise to You'}
            </h2>
            <p className="text-primary-300 text-lg leading-relaxed">
              {s.aboutPromiseDesc || 'Every product we offer is selected with care, every order is processed with attention, and every customer is treated like family.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Info ── */}
      {(s.email || s.phone || s.address) && (
        <section className="py-16 bg-surface-raised">
          <div className="container-custom max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-accent text-sm font-medium uppercase tracking-widest mb-2">Get In Touch</p>
              <h2 className="section-title">Contact Information</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {s.email && (
                <motion.a
                  href={`mailto:${s.email}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="group flex flex-col items-center gap-3 bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <MdEmail size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm mb-1">Email Us</p>
                    <p className="text-sm text-text-muted break-all">{s.email}</p>
                  </div>
                </motion.a>
              )}
              {s.phone && (
                <motion.a
                  href={`tel:${s.phone}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="group flex flex-col items-center gap-3 bg-surface border border-border rounded-2xl p-6 text-center hover:border-accent hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <MdPhone size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm mb-1">Call Us</p>
                    <p className="text-sm text-text-muted">{s.phone}</p>
                  </div>
                </motion.a>
              )}
              {s.address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-3 bg-surface border border-border rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <MdLocationOn size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm mb-1">Visit Us</p>
                    <p className="text-sm text-text-muted">{s.address}{s.city ? `, ${s.city}` : ''}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Social Links ── */}
      {socials.length > 0 && (
        <section className="py-16">
          <div className="container-custom max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-accent text-sm font-medium uppercase tracking-widest mb-2">Follow Along</p>
              <h2 className="section-title mb-8">Find Us On Social Media</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {socials.map(({ icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-white group-hover:border-transparent transition-all duration-300"
                      style={{ ['--hover-color']: 'black' }}
                    >
                      <span className="text-xl">{icon}</span>
                    </div>
                    <span className="text-xs text-text-muted">{label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 bg-primary-900">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Discover Our Fragrances
            </h2>
            <p className="text-primary-300 text-lg mb-8 max-w-xl mx-auto">
              Explore our curated collection of premium fragrances crafted for every moment.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/shop" className="btn-primary px-8 py-3 text-base">
                Shop Now
              </Link>
              <Link to="/contact" className="btn-ghost text-white border border-white/30 hover:border-accent px-8 py-3 text-base">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
