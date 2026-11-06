import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@contexts/CartContext';
import { useTheme } from '@contexts/ThemeContext';
import { getInitials } from '@utils/helpers';
import {
  MdSearch, MdShoppingCart, MdFavorite, MdPerson, MdMenu, MdClose,
  MdDarkMode, MdLightMode, MdLogout, MdAccountCircle, MdShoppingBag,
  MdSettingsBrightness,
} from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { categoryAPI } from '@services/api';

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, modePref, toggleDarkMode, storeSettings } = useTheme();

  const storeName = storeSettings?.storeName || 'Your Store';

  const ThemeToggleIcon = modePref === 'system'
    ? <MdSettingsBrightness size={20} />
    : (isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />);

  // Fetch categories for mega menu
  const { data: catData } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: () => categoryAPI.getAll({ parent: 'null' }),
    staleTime: 5 * 60 * 1000,
    select: d => d.data.data,
  });

  // Sticky header
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/',        label: 'Home',       end: true },
    { to: '/shop',    label: 'Shop' },
    { to: '/about',   label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-surface/95 backdrop-blur-md shadow-card border-b border-border' : 'bg-surface'
      }`}>
        <div className="container-custom relative">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo */}
            <Link to="/" className="font-heading text-xl font-bold text-text-primary hover:text-accent transition-colors shrink-0">
              {storeSettings?.logo?.url
                ? <img src={storeSettings.logo.url} alt={storeName} className="h-10 w-auto" />
                : storeName}
            </Link>

            {/* Desktop Nav (Perfectly Centered) */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-accent bg-accent/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'
                    }`}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Search">
                <MdSearch size={20} />
              </button>

              {/* Dark mode */}
              <button onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors hidden sm:flex"
                aria-label="Toggle dark mode">
                {ThemeToggleIcon}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/account/wishlist"
                  className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors hidden sm:flex"
                  aria-label="Wishlist">
                  <MdFavorite size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart"
                className="relative p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors"
                aria-label={`Cart (${itemCount} items)`}>
                <MdShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-overlay transition-colors"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}>
                  {(user?.avatar?.url || user?.picture)
                    ? <img src={user.avatar?.url || user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-border" />
                    : isAuthenticated
                      ? <div className="w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{getInitials(user?.name)}</div>
                      : <MdPerson size={22} className="text-text-secondary" />
                  }
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-modal overflow-hidden">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-border">
                            <p className="font-semibold text-text-primary text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                          </div>
                          {isAdmin && (
                            <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-accent hover:bg-accent/5 transition-colors">
                              <MdAccountCircle size={16} /> Admin Panel
                            </Link>
                          )}
                          <Link to="/account" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-overlay transition-colors">
                            <MdPerson size={16} /> My Account
                          </Link>
                          <Link to="/account/orders" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-overlay transition-colors">
                            <MdShoppingBag size={16} /> My Orders
                          </Link>
                          <div className="border-t border-border">
                            <button onClick={() => { logout(); setUserMenuOpen(false); }}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left">
                              <MdLogout size={16} /> Logout
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link to="/login" onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-overlay transition-colors">
                            Login
                          </Link>
                          <Link to="/signup" onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm font-medium text-accent hover:bg-accent/5 transition-colors border-t border-border">
                            Create Account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary transition-colors md:hidden"
                aria-label="Toggle menu">
                {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-surface overflow-hidden">
              <div className="container-custom py-4 space-y-1">
                {navLinks.map(l => (
                  <NavLink key={l.to} to={l.to} end={l.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'text-accent bg-accent/5' : 'text-text-secondary hover:bg-surface-overlay'
                      }`}>
                    {l.label}
                  </NavLink>
                ))}
                {/* Categories */}
                {catData?.map(cat => (
                  <Link key={cat._id} to={`/shop?category=${cat._id}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-overlay transition-colors">
                    {cat.name}
                  </Link>
                ))}
                <div className="border-t border-border pt-3 mt-3 flex items-center gap-3">
                  {isAuthenticated ? (
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-2 text-sm text-red-500 px-4 py-2">
                      <MdLogout size={16} /> Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-xs px-4 py-2">Login</Link>
                      <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-xs px-4 py-2">Sign Up</Link>
                    </>
                  )}
                  <button onClick={toggleDarkMode} className="ml-auto p-2 rounded-lg hover:bg-surface-overlay text-text-muted">
                    {ThemeToggleIcon}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl bg-surface rounded-2xl shadow-modal overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                <MdSearch size={22} className="text-text-muted shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-text-primary text-lg outline-none placeholder:text-text-muted"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-overlay text-text-muted">
                  <MdClose size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-18" />
    </>
  );
};

export default Navbar;
