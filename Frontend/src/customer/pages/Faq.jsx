import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { faqAPI, contentPageAPI } from '@services/api';
import { useTheme } from '@contexts/ThemeContext';
import { PageSpinner } from '@components/ui/Spinner';
import { MdChevronRight, MdExpandMore, MdHelpOutline } from 'react-icons/md';
import { clsx } from 'clsx';

const Faq = () => {
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Your Store';
  const [active, setActive] = useState(null);

  const { data: introData } = useQuery({
    queryKey: ['page', 'faq'],
    queryFn: () => contentPageAPI.getOne('faq'),
    select: d => d.data.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => faqAPI.getAll(),
    select: d => d.data.data,
    staleTime: 5 * 60 * 1000,
  });

  const categories = ['All', ...new Set((faqs || []).map(f => f.category).filter(Boolean))];
  const [filter, setFilter] = useState('All');
  const filtered = faqs?.filter(f => filter === 'All' || f.category === filter) || [];

  const introTitle = introData?.title || 'Frequently Asked Questions';
  const introContent = introData?.content || '';

  return (
    <>
      <Helmet><title>{introData?.metaTitle || `FAQ – ${storeName}`}</title></Helmet>

      <div className="container-custom py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <MdChevronRight size={14} />
          <span className="text-text-secondary font-medium">FAQ</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2">{introTitle}</h1>
          <div className="w-16 h-1 bg-accent rounded-full mb-6" />
          {introContent && (
            <div className="prose-content text-text-secondary leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: introContent }} />
          )}

          {/* Category filter */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              {categories.map(c => (
                <button key={c} onClick={() => { setFilter(c); setActive(null); }}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                    filter === c
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-text-secondary hover:bg-surface-overlay'
                  )}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="min-h-[30vh]"><PageSpinner /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <MdHelpOutline className="mx-auto text-5xl mb-3 opacity-40" />
              <p>No FAQs yet. Contact us and we will help you out.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((f) => (
                <div key={f._id}
                  className="bg-surface border border-border rounded-card overflow-hidden">
                  <button
                    onClick={() => setActive(active === f._id ? null : f._id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-raised/50"
                    aria-expanded={active === f._id}>
                    <span className="font-medium text-text-primary">{f.question}</span>
                    <MdExpandMore size={20}
                      className={clsx('text-text-muted shrink-0 transition-transform duration-200',
                        active === f._id && 'rotate-180 text-accent')} />
                  </button>
                  <AnimatePresence>
                    {active === f._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
                          {f.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* Still need help */}
          <div className="mt-10 text-center bg-surface-raised border border-border rounded-card p-8">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Still have questions?</h2>
            <p className="text-sm text-text-muted mb-5">Our team is happy to help you with anything.</p>
            <Link to="/contact" className="btn-primary text-sm">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
