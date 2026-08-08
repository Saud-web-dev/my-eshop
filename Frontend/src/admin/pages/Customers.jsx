import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { analyticsAPI } from '@services/api';
import { formatDate, getInitials } from '@utils/helpers';
import Badge from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import { MdSearch } from 'react-icons/md';
import useDebounce from '@hooks/useDebounce';

const Customers = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const dSearch = useDebounce(search, 400);
  const page = Number(params.get('page') || 1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, dSearch],
    queryFn: () => analyticsAPI.getAllCustomers({ page, limit: 20, search: dSearch }),
    select: d => d.data,
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <Helmet><title>Customers – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
            {pagination && <p className="text-sm text-text-muted">{pagination.total} registered customers</p>}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-4">
          <div className="relative max-w-sm">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…" className="input-base pl-9 text-sm" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Customer', 'Email', 'Joined', 'Verified', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : customers.length === 0
                  ? <tr><td colSpan={5} className="py-12 text-center text-text-muted">No customers found.</td></tr>
                  : customers.map(c => (
                    <tr key={c._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.avatar?.url
                            ? <img src={c.avatar.url} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                            : <div className="w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                                {getInitials(c.name)}
                              </div>
                          }
                          <span className="font-medium text-text-primary">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm">{c.email}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.isVerified ? 'success' : 'warning'}>{c.isVerified ? 'Verified' : 'Unverified'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {pagination?.pages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <Pagination {...pagination} onPageChange={p => {
                const next = new URLSearchParams(params);
                next.set('page', p);
                setParams(next);
              }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Customers;
