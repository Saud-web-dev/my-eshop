import { clsx } from 'clsx';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  const visible = getVisiblePages();
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      <p className="text-sm text-text-muted">
        Showing <span className="font-medium text-text-primary">{start}–{end}</span> of{' '}
        <span className="font-medium text-text-primary">{total}</span> results
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <MdChevronLeft size={18} />
        </button>

        {visible.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx(
                'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-accent text-white'
                  : 'hover:bg-surface-overlay text-text-secondary'
              )}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2 rounded-lg hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <MdChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
