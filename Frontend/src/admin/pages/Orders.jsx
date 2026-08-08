import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { orderAPI } from '@services/api';
import { formatCurrency, formatDate, getErrorMessage } from '@utils/helpers';
import { OrderStatusBadge } from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import Modal from '@components/ui/Modal';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import Input, { Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdSearch, MdVisibility } from 'react-icons/md';
import useDebounce from '@hooks/useDebounce';

const ORDER_STATUSES = [
  'pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded',
];

const Orders = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [note, setNote] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const qc = useQueryClient();

  const page   = Number(params.get('page') || 1);
  const status = params.get('status') || '';

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    next.delete('page');
    setParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status, debouncedSearch],
    queryFn: () => orderAPI.adminGetAll({ page, limit: 15, status, search: debouncedSearch }),
    select: d => d.data,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const statusMutation = useMutation({
    mutationFn: (d) => orderAPI.updateStatus(selected._id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated.');
      setStatusModal(false);
      setSelected(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const openStatusModal = (order) => {
    setSelected(order);
    setNewStatus(order.status);
    setTrackingNo(order.trackingNumber || '');
    setNote('');
    setStatusModal(true);
  };

  return (
    <>
      <Helmet><title>Orders – Admin</title></Helmet>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
            {pagination && <p className="text-sm text-text-muted">{pagination.total} total orders</p>}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order number…" className="input-base pl-9 text-sm" />
          </div>
          <Select value={status} onChange={e => setParam('status', e.target.value)} wrapperClassName="w-auto">
            <option value="">All Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </Select>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised border-b border-border">
                <tr>
                  {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                  : orders.length === 0
                    ? <tr><td colSpan={8} className="py-16 text-center text-text-muted">No orders found.</td></tr>
                    : orders.map(o => (
                      <tr key={o._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-accent font-medium">{o.orderNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{o.user?.name}</p>
                          <p className="text-xs text-text-muted">{o.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-3 text-center">{o.items?.length}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                        <td className="px-4 py-3 text-xs capitalize text-text-secondary">Cash on Delivery</td>
                        <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => openStatusModal(o)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdVisibility size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
          {pagination?.pages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <Pagination {...pagination} onPageChange={p => setParam('page', p)} />
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)}
        title={`Update Order ${selected?.orderNumber}`} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ status: newStatus, trackingNumber: trackingNo, note })}>
              Update Status
            </Button>
          </>
        }>
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </Select>
          <Input label="Tracking Number (optional)" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} />
          <Input label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </Modal>
    </>
  );
};

export default Orders;
