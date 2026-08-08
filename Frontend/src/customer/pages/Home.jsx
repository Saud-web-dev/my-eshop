import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { productAPI, categoryAPI, offerAPI } from '@services/api';
import { ProductCard } from '@components/ui/Card';
import { ProductCardSkeleton } from '@components/ui/SkeletonLoader';
import { useCart } from '@contexts/CartContext';
import { useTheme } from '@contexts/ThemeContext';
import { MdArrowForward, MdLocalShipping, MdVerified, MdHeadset, MdRefresh, MdCategory } from 'react-icons/md';

const FEATURE_ICONS = [
  <MdLocalShipping size={28} />,
  <MdVerified size={28} />,
  <MdHeadset size={28} />,
  <MdRefresh size={28} />,
];

const fadeUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };

const Home = () => {
  const { addToCart }     = useCart();
  const { storeSettings } = useTheme();
  const s = storeSettings || {};

  // Always fetch categories
  const { data: categories } = useQuery({
    queryKey: ['home-categories'],
    queryFn:  () => categoryAPI.getAll(),
    select:   d => d.data.data,
    staleTime: 5 * 60 * 1000,
  });

  // Always fetch latest products
  const { data: allProducts, isLoading: allLoading } = useQuery({
    queryKey: ['home-all-products'],
    queryFn:  () => productAPI.getAll({ limit: 8, sort: 'createdAt-desc' }),
    select:   d => d.data.data,
  });

  // Featured products (only show section if any exist)
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn:  () => productAPI.getAll({ featured: true, limit: 8 }),
    select:   d => d.data.data,
  });

  // New arrivals
  const { data: newData, isLoading: newLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn:  () => productAPI.getAll({ newArrival: true, limit: 4 }),
    select:   d => d.data.data,
  });

  // Offers
  const { data: offers } = useQuery({
    queryKey: ['home-offers'],
    queryFn:  () => offerAPI.getAll({ active: 'true' }),
    select:   d => d.data.data || [],
    staleTime: 5 * 60 * 1000,
    retry:    false,
  });

  const heroImages  = s.heroImages?.length ? s.heroImages : [];
  const features    = s.features?.length   ? s.features   : null;
  const storeName   = s.storeName || '';

  return (
    <>
      <Helmet>
        <title>{s.metaTitle || storeName || 'Home'}</title>
        <meta name="description" content={s.metaDescription || ''} />
        {s.metaKeywords?.length > 0 && (
          <meta name="keywords" content={s.metaKeywords.join(', ')} />
        )}
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        {/* Fallback gradient used while loading / when no hero image is set */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-accent/30" />
        {heroImages[0]?.url && (
          <img
            src={heroImages[0].url}
            alt={heroImages[0].alt || storeName}
            loading="eager"
            onError={e => { e.currentTarget.style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/70 to-primary-900/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface to-transparent" />
        <div className="relative container-custom h-full flex items-center">
          <motion.div
            className="max-w-xl text-white"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {s.heroBadge && (
              <motion.p variants={fadeUp} className="text-accent font-medium mb-3 tracking-widest uppercase text-sm">
                {s.heroBadge}
              </motion.p>
            )}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold font-heading leading-tight mb-6">
              {s.heroTitle || storeName || 'Welcome'}
            </motion.h1>
            {s.heroSubtitle && (
              <motion.p variants={fadeUp} className="text-primary-200 text-lg mb-8 leading-relaxed">
                {s.heroSubtitle}
              </motion.p>
            )}
            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <Link to="/shop" className="btn-primary px-8 py-3 text-base">
                {s.heroCtaLabel || 'Shop Now'}
              </Link>
              {s.aboutUs && (
                <Link to="/about" className="btn-ghost text-white hover:text-accent px-4 py-3 flex items-center gap-2">
                  {s.heroSecondaryLabel || 'Learn More'} <MdArrowForward />
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Bar (admin-configurable) ─────────────────────────────── */}
      {features && (
        <section className="bg-primary-900 text-white py-8">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <motion.div key={i} className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4 }}>
                  <span className="text-accent shrink-0">{FEATURE_ICONS[i % FEATURE_ICONS.length]}</span>
                  <div>
                    <p className="font-semibold text-sm">{f.title}</p>
                    {f.desc && <p className="text-xs text-primary-300">{f.desc}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Active Offers (from admin panel) ──────────────────────────────── */}
      {offers?.length > 0 && (
        <section className="py-10 bg-surface-raised">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map(offer => (
                <Link key={offer._id} to={offer.link || '/shop'}
                  className="group relative overflow-hidden rounded-2xl bg-primary-900 text-white flex flex-col md:flex-row items-stretch min-h-[180px]">
                  {offer.imageUrl && (
                    <div className="md:w-2/5 overflow-hidden">
                      <img src={offer.imageUrl} alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    {offer.badge && (
                      <span className="self-start inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-900 mb-3">
                        {offer.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold font-heading mb-1">{offer.title}</h3>
                    {offer.subtitle && <p className="text-primary-200 text-sm mb-3">{offer.subtitle}</p>}
                    {offer.promoCode && (
                      <p className="inline-flex self-start rounded-lg border border-dashed border-accent px-3 py-1 text-sm font-mono text-accent">
                        CODE: {offer.promoCode}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ────────────────────────────────────────────────────── */}
      {categories?.length > 0 && (
        <section className="py-14">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Shop by Category</h2>
              </div>
              <Link to="/shop" className="btn-ghost text-sm flex items-center gap-1 hidden sm:flex">
                All Categories <MdArrowForward />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <motion.div key={cat._id}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/shop?category=${cat._id}`}
                    className="group flex flex-col items-center gap-3 p-4 bg-surface border border-border rounded-card hover:border-accent hover:shadow-card-hover transition-all duration-300 text-center">
                    {cat.image?.url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-accent transition-colors">
                        <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <MdCategory size={28} className="text-accent" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      {(featuredLoading || (featuredData?.length ?? 0) > 0) && (
        <section className="py-14 bg-surface-raised">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-10">
              <div>
                {s.featuredSectionBadge && (
                  <p className="text-accent text-sm font-medium uppercase tracking-widest mb-2">
                    {s.featuredSectionBadge}
                  </p>
                )}
                <h2 className="section-title">{s.featuredSectionTitle || 'Featured Products'}</h2>
              </div>
              <Link to="/shop?featured=true" className="btn-outline text-sm hidden sm:flex items-center gap-2">
                View All <MdArrowForward />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : featuredData?.map((product, i) => (
                    <motion.div key={product._id}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                      <Link to={`/product/${product.slug || product._id}`}>
                        <ProductCard product={product} onAddToCart={addToCart} />
                      </Link>
                    </motion.div>
                  ))
              }
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop?featured=true" className="btn-outline">View All</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── All / Latest Products (always visible) ────────────────────────── */}
      <section className="py-14">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <h2 className="section-title">Latest Products</h2>
            <Link to="/shop" className="btn-outline text-sm hidden sm:flex items-center gap-2">
              Browse All <MdArrowForward />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {allLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : allProducts?.length === 0
                ? (
                  <div className="col-span-full py-16 text-center">
                    <p className="text-text-muted text-lg mb-3">No products added yet.</p>
                    <p className="text-sm text-text-muted">Add products from the Admin Panel to see them here.</p>
                  </div>
                )
                : allProducts?.map((product, i) => (
                    <motion.div key={product._id}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                      <Link to={`/product/${product.slug || product._id}`}>
                        <ProductCard product={product} onAddToCart={addToCart} />
                      </Link>
                    </motion.div>
                  ))
            }
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/shop" className="btn-outline">Browse All</Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals Banner ───────────────────────────────────────────── */}
      {(newLoading || (newData?.length ?? 0) > 0) && (
        <section className="py-10 bg-surface-raised">
          <div className="container-custom">
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <p className="text-accent font-medium uppercase tracking-widest text-sm mb-2">
                  {s.newArrivalsBadge || 'Just Arrived'}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-2">
                  {s.newArrivalsTitle || 'New Arrivals'}
                </h2>
                {s.newArrivalsDesc && <p className="text-primary-200">{s.newArrivalsDesc}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:max-w-sm">
                {newLoading
                  ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-white/10 skeleton" />)
                  : newData?.slice(0, 4).map(p => (
                      <Link key={p._id} to={`/product/${p.slug || p._id}`}
                        className="aspect-square rounded-xl overflow-hidden border-2 border-white/20 hover:border-accent transition-colors">
                        <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </Link>
                    ))
                }
              </div>
              <Link to="/shop?newArrival=true" className="btn-primary shrink-0">
                {s.newArrivalsCtaLabel || 'Shop New Arrivals'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── About Teaser ─────────────────────────────────────────────────── */}
      {s.aboutUs && (
        <section className="py-14">
          <div className="container-custom max-w-3xl text-center">
            {s.aboutSectionBadge && (
              <p className="text-accent text-sm font-medium uppercase tracking-widest mb-3">
                {s.aboutSectionBadge}
              </p>
            )}
            <h2 className="section-title mb-6">{s.aboutSectionTitle || 'About Us'}</h2>
            <p className="text-text-secondary leading-relaxed text-lg">
              {s.aboutUs.slice(0, 300)}{s.aboutUs.length > 300 ? '…' : ''}
            </p>
            <Link to="/about" className="btn-outline mt-8 inline-block">Learn More</Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
