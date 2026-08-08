import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reviewAPI } from '@services/api';
import { formatDate } from '@utils/helpers';
import Pagination from '@components/ui/Pagination';
import Badge from '@components/ui/Badge';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import { MdStar, MdRateReview } from 'react-icons/md';

const AccountReviews = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews', page],
    queryFn: () => reviewAPI.getMyReviews({ page, limit: 10 }),
    select: d => d.data,
  });

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  if (!isLoading && reviews.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 text-center">
        <MdRateReview size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="font-semibold text-text-primary mb-2">No reviews yet</h3>
        <p className="text-text-muted text-sm mb-6">Review the products you&apos;ve ordered to help other shoppers.</p>
        <Link to="/account/orders" className="btn-outline">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-xl font-bold text-text-primary">My Reviews</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised border-b border-border">
            <tr>
              {['Product', 'Rating', 'Review', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-text-secondary whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              : reviews.map(r => (
                  <tr key={r._id} className="border-b border-border last:border-0 hover:bg-surface-raised/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/product/${r.product?.slug || r.product?._id}`}
                        className="flex items-center gap-3 group">
                        <img src={r.product?.images?.[0]?.url || '/placeholder.jpg'} alt={r.product?.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                        <span className="text-text-primary group-hover:text-accent font-medium line-clamp-1 max-w-[200px]">
                          {r.product?.name || 'Product'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <MdStar key={i} size={14} className={i < r.rating ? '' : 'opacity-25'} />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.title && <p className="font-medium text-text-primary mb-0.5">{r.title}</p>}
                      <p className="line-clamp-2 max-w-[280px]">{r.comment}</p>
                    </td>
                    <td className="px-4 py-3">
                      {r.isHidden
                        ? <Badge variant="danger">Hidden</Badge>
                        : r.isApproved
                          ? <Badge variant="success">Live</Badge>
                          : <Badge variant="warning">Pending</Badge>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
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

export default AccountReviews;
