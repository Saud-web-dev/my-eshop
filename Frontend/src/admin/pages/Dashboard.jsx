import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '@services/api';
import { StatCard } from '@components/ui/Card';
import { OrderStatusBadge } from '@components/ui/Badge';
import { formatCurrency, formatDate, getInitials } from '@utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  MdAttachMoney, MdShoppingCart, MdPeople, MdInventory,
  MdArrowForward, MdStar,
} from 'react-icons/md';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsAPI.getDashboard(),
    select: d => d.data.data,
    refetchInterval: 60_000,
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

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => analyticsAPI.getRecentOrders(),
    select: d => d.data.data,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => analyticsAPI.getTopProducts(),
    select: d => d.data.data,
  });

  const { data: recentCustomers } = useQuery({
    queryKey: ['recent-customers'],
    queryFn: () => analyticsAPI.getRecentCustomers(),
    select: d => d.data.data,
  });

  return (
    <>
      <Helmet><title>Dashboard – Admin</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={<MdAttachMoney />} label="Total Revenue" loading={statsLoading}
            value={formatCurrency(stats?.revenue?.total)}
            change={stats?.revenue?.growth} changeType={stats?.revenue?.growth >= 0 ? 'up' : 'down'} />
          <StatCard icon={<MdShoppingCart />} label="Total Orders" loading={statsLoading}
            value={stats?.orders?.total?.toLocaleString()}
            change={stats?.orders?.growth} changeType={stats?.orders?.growth >= 0 ? 'up' : 'down'} />
          <StatCard icon={<MdPeople />} label="Customers" loading={statsLoading}
            value={stats?.customers?.total?.toLocaleString()} />
          <StatCard icon={<MdInventory />} label="Products" loading={statsLoading}
            value={stats?.products?.total?.toLocaleString()} />
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Today's Orders", value: stats?.orders?.today ?? '—', color: 'text-blue-500' },
            { label: 'Pending Orders', value: stats?.orders?.pending ?? '—', color: 'text-yellow-500', to: '/admin/orders?status=pending' },
            { label: 'Low Stock', value: stats?.products?.lowStock ?? '—', color: 'text-red-500', to: '/admin/products?lowStock=true' },
            { label: 'Pending Reviews', value: stats?.reviews?.pending ?? '—', color: 'text-purple-500', to: '/admin/reviews?isApproved=false' },
          ].map(q => (
            <Link key={q.label} to={q.to || '#'}
              className="bg-surface border border-border rounded-card p-4 hover:shadow-card-hover transition-shadow">
              <p className="text-xs text-text-muted mb-1">{q.label}</p>
              <p className={`text-2xl font-bold ${q.color}`}>{q.value}</p>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="xl:col-span-2 bg-surface border border-border rounded-card p-5">
            <h3 className="font-bold text-text-primary mb-4">Revenue Overview</h3>
            {chart?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-text-muted">No data yet</div>
            )}
          </div>

          {/* Orders chart */}
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
                    {['Order', 'Customer', 'Total', 'Status'].map(h =>
                      <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map(o => (
                    <tr key={o._id} className="border-t border-border hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-accent">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-text-secondary">{o.user?.name}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
        </div>
      </div>
    </>
  );
};

export default Dashboard;
