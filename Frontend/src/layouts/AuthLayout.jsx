import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '@contexts/ThemeContext';

const AuthLayout = () => {
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || import.meta.env.VITE_APP_NAME || 'Your Store';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            {storeSettings?.logo?.url ? (
              <img src={storeSettings.logo.url} alt={storeName} className="h-12 mx-auto" />
            ) : (
              <h1 className="text-3xl font-bold text-white tracking-wide font-heading">
                {storeName}
              </h1>
            )}
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-surface rounded-2xl shadow-modal p-8">
          <Outlet />
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
