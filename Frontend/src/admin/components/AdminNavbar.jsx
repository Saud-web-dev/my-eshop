import { Link } from 'react-router-dom';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { MdMenu, MdDarkMode, MdLightMode, MdNotifications, MdStorefront } from 'react-icons/md';

const AdminNavbar = ({ onMenuClick }) => {
  const { isDark, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-4 md:px-6 gap-4 shrink-0 z-20">
      {/* Mobile menu button */}
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-surface-overlay text-text-secondary">
        <MdMenu size={22} />
      </button>

      {/* Page title slot – filled by children if needed */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Link to="/" target="_blank"
          className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors"
          title="View Store">
          <MdStorefront size={20} />
        </Link>

        <button onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors">
          <MdNotifications size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center ml-1">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
