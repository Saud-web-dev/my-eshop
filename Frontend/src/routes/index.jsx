import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageSpinner } from '@components/ui/Spinner';
import { RequireAuth, RequireAdmin, RequireGuest, RequireSetup } from './ProtectedRoute';

// Layouts
import CustomerLayout from '@layouts/CustomerLayout';
import AdminLayout    from '@layouts/AdminLayout';
import AuthLayout     from '@layouts/AuthLayout';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Home           = lazy(() => import('@customer/pages/Home'));
const Shop           = lazy(() => import('@customer/pages/Shop'));
const ProductDetail  = lazy(() => import('@customer/pages/ProductDetail'));
const Cart           = lazy(() => import('@customer/pages/Cart'));
const Checkout       = lazy(() => import('@customer/pages/Checkout'));
const AccountLayout  = lazy(() => import('@customer/pages/Account'));
const AccountProfile = lazy(() => import('@customer/pages/AccountProfile'));
const AccountOrders  = lazy(() => import('@customer/pages/AccountOrders'));
const AccountWishlist    = lazy(() => import('@customer/pages/AccountWishlist'));
const AccountReviews     = lazy(() => import('@customer/pages/AccountReviews'));
const AccountAddresses   = lazy(() => import('@customer/pages/AccountAddresses'));

// Auth
const Login          = lazy(() => import('@pages/Login'));
const Signup         = lazy(() => import('@pages/Signup'));
const AdminSignup    = lazy(() => import('@pages/AdminSignup'));
const VerifyOTP      = lazy(() => import('@pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('@pages/ResetPassword'));

// Customer info pages
const About          = lazy(() => import('@customer/pages/About'));
const Contact        = lazy(() => import('@customer/pages/Contact'));
const Faq            = lazy(() => import('@customer/pages/Faq'));
const TrackOrder     = lazy(() => import('@customer/pages/TrackOrder'));
const Shipping       = lazy(() => import('@customer/pages/Shipping'));
const Returns        = lazy(() => import('@customer/pages/Returns'));
const PrivacyPolicy  = lazy(() => import('@customer/pages/PrivacyPolicy'));
const Terms          = lazy(() => import('@customer/pages/Terms'));
const RefundPolicy   = lazy(() => import('@customer/pages/RefundPolicy'));

// Admin
const SetupWizard = lazy(() => import('@admin/pages/SetupWizard'));
const Dashboard   = lazy(() => import('@admin/pages/Dashboard'));
const Analytics   = lazy(() => import('@admin/pages/Analytics'));
const Products    = lazy(() => import('@admin/pages/Products'));
const ProductForm = lazy(() => import('@admin/pages/ProductForm'));
const Categories  = lazy(() => import('@admin/pages/Categories'));
const Orders      = lazy(() => import('@admin/pages/Orders'));
const Customers   = lazy(() => import('@admin/pages/Customers'));
const Reviews     = lazy(() => import('@admin/pages/Reviews'));
const Coupons     = lazy(() => import('@admin/pages/Coupons'));
const Faqs        = lazy(() => import('@admin/pages/Faqs'));
const Pages       = lazy(() => import('@admin/pages/Pages'));
const Offers      = lazy(() => import('@admin/pages/Offers'));
const Settings    = lazy(() => import('@admin/pages/Settings'));
const NotFound    = lazy(() => import('@pages/NotFound'));

const wrap = (el) => <Suspense fallback={<PageSpinner />}>{el}</Suspense>;

const router = createBrowserRouter(
  [
    // ── Customer store ────────────────────────────────────────────────────────
    {
      element: <CustomerLayout />,
      children: [
        { path: '/',            element: wrap(<Home />) },
        { path: '/shop',        element: wrap(<Shop />) },
        { path: '/product/:id', element: wrap(<ProductDetail />) },
        { path: '/cart',        element: wrap(<Cart />) },
        { path: '/about',       element: wrap(<About />) },
        { path: '/contact',     element: wrap(<Contact />) },
        { path: '/faq',         element: wrap(<Faq />) },
        { path: '/track-order', element: wrap(<TrackOrder />) },
        { path: '/shipping',    element: wrap(<Shipping />) },
        { path: '/returns',     element: wrap(<Returns />) },
        { path: '/privacy-policy', element: wrap(<PrivacyPolicy />) },
        { path: '/terms',       element: wrap(<Terms />) },
        { path: '/refund-policy', element: wrap(<RefundPolicy />) },
        {
          path: '/checkout',
          element: <RequireAuth>{wrap(<Checkout />)}</RequireAuth>,
        },
        {
          path: '/account',
          element: <RequireAuth>{wrap(<AccountLayout />)}</RequireAuth>,
          children: [
            { index: true,          element: wrap(<AccountProfile />) },
            { path: 'orders',       element: wrap(<AccountOrders />) },
            { path: 'wishlist',     element: wrap(<AccountWishlist />) },
            { path: 'reviews',      element: wrap(<AccountReviews />) },
            { path: 'addresses',    element: wrap(<AccountAddresses />) },
          ],
        },
      ],
    },

    // ── Auth pages ────────────────────────────────────────────────────────────
    {
      element: <AuthLayout />,
      children: [
        { path: '/login',           element: <RequireGuest>{wrap(<Login />)}</RequireGuest> },
        { path: '/signup',          element: <RequireGuest>{wrap(<Signup />)}</RequireGuest> },
        { path: '/admin-signup',    element: wrap(<AdminSignup />) },
        { path: '/verify-otp',      element: wrap(<VerifyOTP />) },
        { path: '/forgot-password', element: <RequireGuest>{wrap(<ForgotPassword />)}</RequireGuest> },
        { path: '/reset-password',  element: wrap(<ResetPassword />) },
      ],
    },

    // ── Admin setup wizard ────────────────────────────────────────────────────
    {
      path: '/admin/setup',
      element: <RequireSetup>{wrap(<SetupWizard />)}</RequireSetup>,
    },

    // ── Admin panel ───────────────────────────────────────────────────────────
    {
      path: '/admin',
      element: <RequireAdmin><AdminLayout /></RequireAdmin>,
      children: [
        { index: true,             element: <Navigate to="/admin/dashboard" replace /> },
        { path: 'dashboard',       element: wrap(<Dashboard />) },
        { path: 'analytics',       element: wrap(<Analytics />) },
        { path: 'products',        element: wrap(<Products />) },
        { path: 'products/new',    element: wrap(<ProductForm />) },
        { path: 'products/:id/edit', element: wrap(<ProductForm />) },
        { path: 'categories',      element: wrap(<Categories />) },
        { path: 'orders',          element: wrap(<Orders />) },
        { path: 'customers',       element: wrap(<Customers />) },
        { path: 'reviews',         element: wrap(<Reviews />) },
        { path: 'coupons',         element: wrap(<Coupons />) },
        { path: 'faqs',            element: wrap(<Faqs />) },
        { path: 'pages',           element: wrap(<Pages />) },
        { path: 'offers',          element: wrap(<Offers />) },
        { path: 'settings',        element: wrap(<Settings />) },
      ],
    },

    // ── 404 ───────────────────────────────────────────────────────────────────
    { path: '*', element: wrap(<NotFound />) },
  ],
  {
    // v7_startTransition is the only flag supported in react-router-dom 6.x
    future: {
      v7_startTransition: true,
    },
  }
);

export default router;
