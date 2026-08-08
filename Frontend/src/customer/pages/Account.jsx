import { Outlet, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { getInitials } from '@utils/helpers';
import {
  MdPerson, MdShoppingBag, MdFavorite, MdLocationOn,
  MdLogout, MdStar,
} from 'react-icons/md';

const NAV = [
  { to: '/account',          label: 'Profile',     icon: <MdPerson size={18} />,     end: true },
  { to: '/account/orders',   label: 'My Orders',   icon: <MdShoppingBag size={18} /> },
  { to: '/account/wishlist', label: 'Wishlist',     icon: <MdFavorite size={18} />    },
  { to: '/account/reviews',  label: 'My Reviews',  icon: <MdStar size={18} />        },
  { to: '/account/addresses',label: 'Addresses',   icon: <MdLocationOn size={18} />  },
];

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Your Store';

  return (
    <>
      <Helmet><title>My Account – {storeName}</title></Helmet>
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-card p-5">
              {/* User info */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
                {user?.avatar?.url
                  ? <img src={user.avatar.url} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  : <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center">
                      {getInitials(user?.name)}
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate">{user?.name}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {NAV.map(n => (
                  <NavLink key={n.to} to={n.to} end={n.end}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`}>
                    {n.icon}{n.label}
                  </NavLink>
                ))}
                <button onClick={logout}
                  className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <MdLogout size={18} /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AccountLayout;
