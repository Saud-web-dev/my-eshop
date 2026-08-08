import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, categoryAPI } from '@services/api';
import { ProductCard } from '@components/ui/Card';
import { ProductCardSkeleton } from '@components/ui/SkeletonLoader';
import Pagination from '@components/ui/Pagination';
import { useCart } from '@contexts/CartContext';
import { useTheme } from '@contexts/ThemeContext';
import useDebounce from '@hooks/useDebounce';
import { MdFilterList, MdClose, MdSearch, MdGridView, MdViewList } from 'react-icons/md';
import { clsx } from 'clsx';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc',      label: 'Price: Low to High' },
  { value: 'price-desc',     label: 'Price: High to Low' },
  { value: 'rating-desc',    label: 'Best Rated' },
  { value: 'sales-desc',     label: 'Best Selling' },
];

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridView, setGridView] = useState(true);
  const { addToCart } = useCart();
  const { storeSettings } = useTheme();

  const [localSearch, setLocalSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(localSearch, 400);

  const [localMin, setLocalMin] = useState(params.get('minPrice') || '');
  const [localMax, setLocalMax] = useState(params.get('maxPrice') || '');
  const debouncedMin = useDebounce(localMin, 500);
  const debouncedMax = useDebounce(localMax, 500);

  const page     = Number(params.get('page') || 1);
  const category = params.get('category') || '';
  const sort     = params.get('sort') || 'createdAt-desc';
  const minPrice = debouncedMin;
  const maxPrice = debouncedMax;
  const featured = params.get('featured') || '';
  const newArrival = params.get('newArrival') || '';
  const bestSeller = params.get('bestSeller') || '';

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    if (debouncedSearch !== (params.get('search') || '')) setParam('search', debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    if (debouncedMin !== (params.get('minPrice') || '')) setParam('minPrice', debouncedMin);
  }, [debouncedMin]);

  useEffect(() => {
    if (debouncedMax !== (params.get('maxPrice') || '')) setParam('maxPrice', debouncedMax);
  }, [debouncedMax]);

  // Keep local price state in sync when URL is cleared externally
  useEffect(() => {
    setLocalMin(params.get('minPrice') || '');
    setLocalMax(params.get('maxPrice') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('minPrice'), params.get('maxPrice')]);

  const clearAll = () => {
    setParams({});
    setLocalSearch('');
    setLocalMin('');
    setLocalMax('');
  };

  const { data: catData } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => categoryAPI.getAll(),
    select: d => d.data.data,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products', page, category, sort, minPrice, maxPrice, debouncedSearch, featured, newArrival, bestSeller],
    queryFn: () => productAPI.getAll({
      page, limit: 12, category, sort, minPrice, maxPrice,
      search: debouncedSearch,
      ...(featured && { featured }),
      ...(newArrival && { newArrival }),
      ...(bestSeller && { bestSeller }),
    }),
    select: d => d.data,
    keepPreviousData: true,
  });

  const products   = data?.data || [];
  const pagination = data?.pagination;

  const FilterPanel = ({ mobile = false }) => (
    <div className={clsx('space-y-6', mobile && 'pt-4')}>
      {/* Search */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Search</p>
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search products…"
            className="input-base pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Category</p>
        <div className="space-y-1.5">
          <button onClick={() => setParam('category', '')}
            className={clsx('w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
              !category ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:bg-surface-overlay')}>
            All Categories
          </button>
          {catData?.map(cat => (
            <button key={cat._id} onClick={() => setParam('category', cat._id)}
              className={clsx('w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                category === cat._id ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:bg-surface-overlay')}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Price Range</p>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={localMin}
            onChange={e => setLocalMin(e.target.value)}
            className="input-base text-sm" />
          <span className="text-text-muted">–</span>
          <input type="number" placeholder="Max" value={localMax}
            onChange={e => setLocalMax(e.target.value)}
            className="input-base text-sm" />
        </div>
      </div>

      {/* Labels */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Filter By</p>
        <div className="space-y-1.5">
          {[
            { key: 'featured',   label: 'Featured' },
            { key: 'newArrival', label: 'New Arrivals' },
            { key: 'bestSeller', label: 'Best Sellers' },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={params.get(f.key) === 'true'}
                onChange={e => setParam(f.key, e.target.checked ? 'true' : '')}
                className="accent-accent" />
              <span className="text-sm text-text-secondary">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      <button onClick={clearAll}
        className="w-full btn-ghost text-sm border border-border">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Shop – {storeSettings?.storeName || 'Store'}</title>
        <meta name="description" content={storeSettings?.metaDescription || 'Browse all products in our store.'} />
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-heading">
              {featured === 'true' ? 'Featured Products' :
               newArrival === 'true' ? 'New Arrivals' :
               bestSeller === 'true' ? 'Best Sellers' :
               category ? (catData?.find(c => c._id === category)?.name || 'Products') :
               'All Products'}
            </h1>
            {pagination && (
              <p className="text-sm text-text-muted mt-0.5">{pagination.total} products</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 btn-outline text-sm lg:hidden">
              <MdFilterList size={16} /> Filters
            </button>
            {/* Sort */}
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              className="input-base text-sm w-auto">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Grid toggle */}
            <div className="hidden sm:flex gap-1 border border-border rounded-lg p-0.5">
              <button onClick={() => setGridView(true)}
                className={clsx('p-1.5 rounded', gridView && 'bg-surface-overlay')}>
                <MdGridView size={16} />
              </button>
              <button onClick={() => setGridView(false)}
                className={clsx('p-1.5 rounded', !gridView && 'bg-surface-overlay')}>
                <MdViewList size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-surface rounded-card border border-border p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className={clsx(
              'grid gap-4 md:gap-5',
              gridView ? 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            )}>
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products.length === 0
                    ? (
                    <div className="col-span-full py-24 text-center">
                      <p className="text-text-muted text-lg mb-4">No products found.</p>
                      <button onClick={clearAll}
                        className="btn-outline">Clear Filters</button>
                    </div>
                  )
                  : products.map((p, i) => (
                    <motion.div key={p._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}>
                      <Link to={`/product/${p.slug || p._id}`}>
                        <ProductCard product={p} onAddToCart={addToCart} />
                      </Link>
                    </motion.div>
                  ))
              }
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  total={pagination.total}
                  limit={12}
                  onPageChange={p => { setParam('page', p); window.scrollTo({ top: 0 }); }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)} />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-surface shadow-modal overflow-y-auto"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary">Filters</h3>
                <button onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-overlay"><MdClose size={20} /></button>
              </div>
              <div className="p-4">
                <FilterPanel mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Shop;
