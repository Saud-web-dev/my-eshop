import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { contentPageAPI } from '@services/api';
import { useTheme } from '@contexts/ThemeContext';
import { PageSpinner } from '@components/ui/Spinner';
import { MdChevronRight, MdArticle } from 'react-icons/md';

/**
 * Renders a CMS-managed static page.
 * Admin creates/edits these pages via Admin → Pages.
 * If not yet created, shows a neutral "coming soon" message.
 */
const InfoPage = ({ slug, fallbackTitle }) => {
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Store';

  const { data, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn:  () => contentPageAPI.getOne(slug),
    select:   d => d.data.data,
    staleTime: 5 * 60 * 1000,
    retry:    false,
    // 404 from server when page not created yet — treat as "no data"
    onError:  () => {},
  });

  const title   = data?.title   || fallbackTitle;
  const content = data?.content || '';

  return (
    <>
      <Helmet>
        <title>{data?.metaTitle || `${title} – ${storeName}`}</title>
        {data?.metaDescription && <meta name="description" content={data.metaDescription} />}
      </Helmet>

      {isLoading ? (
        <div className="min-h-[40vh]"><PageSpinner /></div>
      ) : (
        <div className="container-custom py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <MdChevronRight size={14} />
            <span className="text-text-secondary font-medium">{title}</span>
          </nav>

          {/* Hero image */}
          {data?.image?.url && (
            <div className="rounded-card overflow-hidden mb-8">
              <img src={data.image.url} alt={title} className="w-full h-48 md:h-72 object-cover" />
            </div>
          )}

          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2">{title}</h1>
            <div className="w-16 h-1 bg-accent rounded-full mb-8" />

            {content ? (
              <div
                className="prose-content space-y-4 text-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center py-16 text-text-muted">
                <MdArticle className="mx-auto text-5xl mb-4 opacity-40" />
                <p className="text-lg font-medium mb-2">This page hasn't been set up yet.</p>
                <p className="text-sm mb-6">
                  Go to <strong>Admin → Pages</strong> and create a page with slug{' '}
                  <code className="bg-surface-overlay px-1.5 py-0.5 rounded text-accent">{slug}</code> to add content here.
                </p>
                <Link to="/" className="btn-outline text-sm">← Back to Home</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InfoPage;
