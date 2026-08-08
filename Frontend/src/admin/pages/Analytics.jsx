import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '@services/api';
import { StatCard } from '@components/ui/Card';
import { OrderStatusBadge } from '@components/ui/Badge';
import { formatCurrency, formatDate, getInitials } from '@utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  MdAttachMoney, MdShoppingCart, MdTrendingUp, MdShoppingBasket, MdArrowForward, MdStar,
} from 'react-icons/md';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending:          '#f59e0b',
  confirmed:        '#3b82f6',
  processing:       '#8b5cf6',
  shipped:          '#6d28d9',
  out_for_delivery: '#d97706',
  delivered:        '#22c55e',
  cancelled:        '#ef4444',
  return_requested: '#f97316',
  returned:         '#6b7280',
  refunded:         '#dc2626',
};

const CATEGORY_COLORS = ['#e94560', '#8b5cf6', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6366f1', '#a855f7'];

const Analytics = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsAPI.getDashboard(),
    select: d => d.data.data,
  });

  const { data: chart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => analyticsAPI.getRevenueChart(),
    select: d => d.data.data.map(item => ({
      name: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    })),
  });

  const { data: ordersByStatus } = useQuery({
    queryKey: ['orders-by-status'],
    queryFn: () => analyticsAPI.getOrdersByStatus(),
    select: d => d.data.data.map(item => ({
      name: item._id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: item.count,
      status: item._id,
    })),
  });

  const { data: topCategories } = useQuery({
    queryKey: ['top-categories'],
    queryFn: () => analyticsAPI.getTopCategories(),
    select: d => d.data.data,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => analyticsAPI.getTopProducts(),
    select: d => d.data.data,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => analyticsAPI.getRecentOrders(),
    select: d => d.data.data,
  });

  const { data: recentCustomers } = useQuery({
    queryKey: ['recent-customers'],
    queryFn: () => analyticsAPI.getRecentCustomers(),
    select: d => d.data.data,
  });

  const totalSold = topProducts?.reduce((acc, p) => acc + (p.salesCount || 0), 0) || 0;
  const totalOrdered = ordersByStatus?.reduce((acc, s) => acc + s.value, 0) || 0;

  return (
    <>
      <Helmet><title>Analytics – Admin</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted text-sm mt-0.5">In-depth performance insights for your store.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<MdAttachMoney />} label="Total Revenue" loading={statsLoading}
            value={formatCurrency(stats?.revenue?.total)}
            change={stats?.revenue?.growth} changeType={stats?.revenue?.growth >= 0 ? 'up' : 'down'} />
          <StatCard icon={<MdShoppingCart />} label="Total Orders" loading={statsLoading}
            value={stats?.orders?.total?.toLocaleString()}
            change={stats?.orders?.growth} changeType={stats?.orders?.growth >= 0 ? 'up' : 'down'} />
          <StatCard icon={<MdTrendingUp />} label="Avg Order Value" loading={statsLoading}
            value={stats?.orders?.total ? formatCurrency(stats?.revenue?.total / stats?.orders?.total) : '—'} />
          <StatCard icon={<MdShoppingBasket />} label="Items Sold" loading={statsLoading}
            value={totalSold.toLocaleString()} />
        </div>

        {/* Revenue + Orders by status */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-surface border border-border rounded-card p-5">
            <h3 className="font-bold text-text-primary mb-4">Revenue Overview</h3>
            {chart?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsColorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(233 69 96)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgb(233 69 96)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }}
                    tickFormatter={v => `₨${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '8px' }}
                    formatter={v => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="rgb(233,69,96)" strokeWidth={2}
                    fill="url(#analyticsColorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-card p-5">
            <h3 className="font-bold text-text-primary mb-2">Orders by Status</h3>
            <p className="text-xs text-text-muted mb-2">{totalOrdered.toLocaleString()} orders total</p>
            {ordersByStatus?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ordersByStatus} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {ordersByStatus.map(s => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </div>
        </div>

        {/* Top categories + Monthly orders */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-card p-5">
            <h3 className="font-bold text-text-primary mb-4">Top Categories by Units Sold</h3>
            {topCategories?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }} />
                  <YAxis type="category" dataKey="_id" width={110}
                    tick={{ fontSize: 11, fill: 'rgb(var(--color-text-muted))' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '8px' }}
                    formatter={(v, _n, i) => [`${v} units · ${formatCurrency(i.payload.revenue)}`, 'Category']} />
                  <Bar dataKey="sold" radius={[0,4,4,0]}>
                    {topCategories.map((c, i) => (
                      <Cell key={c._id} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-card p-5">
            <h3 className="font-bold text-text-primary mb-4">Monthly Orders</h3>
            {chart?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgb(var(--color-text-muted))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgb(var(--color-text-muted))' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '8px' }} />
                  <Bar dataKey="orders" fill="rgb(233,69,96)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="bg-surface border border-border rounded-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-text-primary">Top Products</h3>
              <Link to="/admin/products" className="text-xs text-accent hover:underline flex items-center gap-1">
                View all <MdArrowForward size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-raised/50 transition-colors">
                  <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                  <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.salesCount} sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-accent">{formatCurrency(p.price)}</p>
                    {p.averageRating > 0 && (
                      <p className="text-xs text-yellow-500 flex items-center justify-end gap-0.5">
                        <MdStar size={12} />{p.averageRating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent customers */}
          <div className="bg-surface border border-border rounded-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-text-primary">Recent Customers</h3>
              <Link to="/admin/customers" className="text-xs text-accent hover:underline flex items-center gap-1">
                View all <MdArrowForward size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-raised text-xs text-text-muted">
                  <tr>
                    {['Customer', 'Orders', 'Spent', 'Joined'].map(h =>
                      <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers?.map(c => (
                    <tr key={c._id} className="border-t border-border hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold
                            flex items-center justify-center shrink-0">{getInitials(c.name)}</span>
                          <span className="text-text-secondary">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{c.orderCount ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold">{c.totalSpent ? formatCurrency(c.totalSpent) : '—'}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-bold text-text-primary">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <MdArrowForward size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised text-xs text-text-muted">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h =>
                    <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map(o => (
                  <tr key={o._id} className="border-t border-border hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-accent">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-text-secondary">{o.user?.name}</td>
                    <td className="px-4 py-3 text-text-muted">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-text-muted text-xs">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
