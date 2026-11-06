import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '@services/api';
import { formatCurrency } from '@utils/helpers';
import { StockBadge } from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import useDebounce from '@hooks/useDebounce';
import { downloadCsvTemplate, parseCsv } from '@utils/csv';
import {
  MdAdd, MdEdit, MdDelete, MdSearch,
  MdToggleOn, MdToggleOff, MdRestoreFromTrash, MdUploadFile,
} from 'react-icons/md';

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [confirmId, setConfirmId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const importInput = useRef(null);
  const debouncedSearch = useDebounce(search, 400);
  const qc = useQueryClient();

  const page     = Number(params.get('page') || 1);
  const category = params.get('category') || '';
  const isActive = params.get('isActive') ?? 'all';

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v !== '' && v !== null) next.set(k, v); else next.delete(k);
    next.delete('page');
    setParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, debouncedSearch, category, isActive],
    queryFn: () => productAPI.getAll({ page, limit: 15, search: debouncedSearch, category, isActive }),
    select: d => d.data,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted.');
      setConfirmId(null);
    },
    onError: () => toast.error('Failed to delete product.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => productAPI.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Status updated.');
    },
  });

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('CSV file must be 1 MB or smaller.');
      return;
    }

    setImporting(true);
    try {
      const items = parseCsv(await file.text());
      if (items.length > 50) throw new Error('Import a maximum of 50 products per CSV.');
      const { data } = await productAPI.bulkImport(items);
      const report = data.data;
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['shop-products'] });
      qc.invalidateQueries({ queryKey: ['home-all-products'] });
      qc.invalidateQueries({ queryKey: ['featured-products'] });
      qc.invalidateQueries({ queryKey: ['new-arrivals'] });
      setImportReport(report);
      toast.success(`${report.createdCount} product(s) imported${report.failedCount ? `; ${report.failedCount} row(s) need attention` : ''}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not import CSV.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Helmet><title>Products – Admin</title></Helmet>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Products</h1>
            {pagination && <p className="text-sm text-text-muted">{pagination.total} total products</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input ref={importInput} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
            <button type="button" className="btn-outline flex items-center gap-2 self-start"
              onClick={() => importInput.current?.click()} disabled={importing}>
              <MdUploadFile size={18} /> {importing ? 'Importing…' : 'Import CSV'}
            </button>
            <button type="button" className="text-sm text-text-secondary hover:text-accent"
              onClick={() => downloadCsvTemplate('products-template.csv',
                ['name', 'category', 'price', 'salePrice', 'stock', 'brand', 'sku', 'description', 'shortDescription', 'tags', 'isFeatured', 'isNewArrival', 'isBestSeller', 'isActive'],
                ['Example Fragrance', 'Fragrance', '2500', '2200', '10', 'Brand', 'SKU-001', 'Product description', 'Short description', 'fresh,floral', 'false', 'true', 'false', 'true'])}>
              Download template
            </button>
            <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 self-start">
              <MdAdd size={18} /> Add Product
            </Link>
          </div>
        </div>
        <p className="text-xs text-text-muted">
          CSV import accepts up to 50 rows. Import categories first; each product must reference an existing category name or ID. Add product images from the product editor after import.
        </p>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-base pl-9 text-sm" />
          </div>
          <select value={isActive} onChange={e => setParam('isActive', e.target.value)}
            className="input-base text-sm w-auto">
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised border-b border-border">
                <tr>
                  {['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : products.length === 0
                    ? (
                      <tr><td colSpan={6} className="py-16 text-center text-text-muted">No products found.</td></tr>
                    )
                    : products.map(p => (
                      <tr key={p._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                            <div className="min-w-0">
                              <Link to={`/admin/products/${p._id}`}
                                className="font-medium text-text-primary hover:text-accent transition-colors truncate block max-w-[200px]">
                                {p.name}
                              </Link>
                              {p.sku && <p className="text-xs text-text-muted">SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-semibold text-accent">{formatCurrency(p.salePrice || p.price)}</span>
                            {p.salePrice && (
                              <span className="text-xs text-text-muted line-through ml-1.5">{formatCurrency(p.price)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                        <td className="px-4 py-3 text-text-secondary">{p.category?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleMutation.mutate(p._id)}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors ${p.isActive ? 'text-green-600' : 'text-text-muted'}`}>
                            {p.isActive ? <MdToggleOn size={20} /> : <MdToggleOff size={20} />}
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/admin/products/${p._id}/edit`}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                              <MdEdit size={16} />
                            </Link>
                            {p.isDeleted ? (
                              <button onClick={() => productAPI.restore(p._id).then(() => qc.invalidateQueries(['admin-products']))}
                                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500 transition-colors">
                                <MdRestoreFromTrash size={16} />
                              </button>
                            ) : (
                              <button onClick={() => setConfirmId(p._id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                                <MdDelete size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <Pagination {...pagination} onPageChange={p => setParam('page', p)} />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be soft-deleted and can be restored."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />

      <Modal open={!!importReport} onClose={() => setImportReport(null)} title="Product import report" size="lg">
        {importReport && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Imported {importReport.createdCount}; failed {importReport.failedCount}. Product images are not imported from CSV—add them from each product editor.
            </p>
            {importReport.errors?.length > 0 && (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {importReport.errors.map(error => (
                  <p key={`${error.row}-${error.message}`} className="px-3 py-2 text-sm text-red-600">
                    Row {error.row}: {error.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Products;
