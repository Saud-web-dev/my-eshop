import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { getInitials } from '@utils/helpers';
import { clsx } from 'clsx';
import {
  MdDashboard, MdInventory, MdCategory, MdShoppingCart, MdPeople,
  MdStar, MdLocalOffer, MdSettings, MdStorefront, MdClose,
  MdLogout, MdChevronLeft, MdChevronRight, MdBarChart, MdArticle,
  MdHelpOutline,
} from 'react-icons/md';

const MENU = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: <MdDashboard size={18} />, label: 'Dashboard' },
      { to: '/admin/analytics', icon: <MdBarChart size={18} />, label: 'Analytics' },
    ],
  },
  {
    label: 'Store',
    items: [
      { to: '/admin/products',   icon: <MdInventory size={18} />,    label: 'Products' },
      { to: '/admin/categories', icon: <MdCategory size={18} />,     label: 'Categories' },
      { to: '/admin/offers',     icon: <MdLocalOffer size={18} />,   label: 'Offers & Sales' },
      { to: '/admin/orders',     icon: <MdShoppingCart size={18} />, label: 'Orders' },
      { to: '/admin/customers',  icon: <MdPeople size={18} />,       label: 'Customers' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/reviews',  icon: <MdStar size={18} />,      label: 'Reviews' },
      { to: '/admin/coupons',  icon: <MdLocalOffer size={18} />, label: 'Coupons' },
      { to: '/admin/pages',    icon: <MdArticle size={18} />,   label: 'Pages' },
      { to: '/admin/faqs',     icon: <MdHelpOutline size={18} />, label: 'FAQs' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/settings', icon: <MdSettings size={18} />,   label: 'Settings' },
      { to: '/',               icon: <MdStorefront size={18} />, label: 'View Store', external: true },
    ],
  },
];

const AdminSidebar = ({ open, collapsed, onClose, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { storeSettings } = useTheme();
  const navigate = useNavigate();
  const storeName = storeSettings?.storeName || 'Your Store';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={clsx(
        'flex items-center border-b border-border h-16 px-4 shrink-0',
        collapsed ? 'justify-center' : 'justify-between gap-3'
      )}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="font-heading font-bold text-text-primary truncate text-sm">
            {storeSettings?.logo?.url
              ? <img src={storeSettings.logo.url} alt={storeName} className="h-8 w-auto" />
              : storeName}
          </Link>
        )}
        <button onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-surface-overlay text-text-muted transition-colors shrink-0">
          {collapsed ? <MdChevronRight size={18} /> : <MdChevronLeft size={18} />}
        </button>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-overlay text-text-muted">
          <MdClose size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {MENU.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-3 mb-1.5">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin/dashboard'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => clsx(
                    'sidebar-link',
                    collapsed && 'justify-center px-2',
                    isActive && item.to !== '/' && 'active'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={clsx(
        'shrink-0 border-t border-border p-3',
        collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2'
      )}>
        <div className={clsx('flex items-center gap-3 px-2 py-1.5 rounded-lg', !collapsed && 'w-full')}>
          {user?.avatar?.url
            ? <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            : <div className="w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
          }
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={clsx(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors',
            collapsed ? 'justify-center w-full' : 'w-full'
          )}>
          <MdLogout size={16} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-surface border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface border-r border-border flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
