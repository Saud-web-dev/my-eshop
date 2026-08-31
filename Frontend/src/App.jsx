import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider }  from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { CartProvider }  from '@contexts/CartContext';
import router from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const toastStyle = {
  background: 'rgb(var(--color-surface))',
  color: 'rgb(var(--color-text-primary))',
  border: '1px solid rgb(var(--color-border))',
  borderRadius: '0.75rem',
  fontSize: '14px',
  boxShadow: '0 4px 20px rgb(0 0 0 / 0.12)',
};

// GoogleOAuthProvider must be mounted ONCE at the very top level.
// Placing it inside RouterProvider would cause it to re-initialize
// on every route change, triggering the "called multiple times" warning.
const App = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || ''}>
    
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: toastStyle,
                  success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  </GoogleOAuthProvider>
);

export default App;
