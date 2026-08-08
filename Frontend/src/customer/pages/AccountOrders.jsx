import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '@services/api';
import { formatCurrency, formatDate } from '@utils/helpers';
import { OrderStatusBadge } from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import { MdShoppingBag, MdChevronRight } from 'react-icons/md';

const AccountOrders = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderAPI.getMyOrders({ page, limit: 10 }),
    select: d => d.data,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  if (!isLoading && orders.length === 0) return (
    <div className="bg-surface border border-border rounded-card p-12 text-center">
      <MdShoppingBag size={48} className="mx-auto text-text-muted mb-4" />
      <h3 className="font-semibold text-text-primary mb-2">No orders yet</h3>
      <p className="text-text-muted text-sm mb-6">Your order history will appear here.</p>
      <Link to="/shop" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-xl font-bold text-text-primary">My Orders</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised border-b border-border">
            <tr>
              {['Order #', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : orders.map(order => (
                <tr key={order._id} className="border-b border-border last:border-0 hover:bg-surface-raised/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-accent">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-text-secondary">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/account/orders/${order._id}`}
                      className="flex items-center gap-1 text-accent hover:underline text-xs font-medium">
                      Details <MdChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-border">
          <Pagination {...pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
