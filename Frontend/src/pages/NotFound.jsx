import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => (
  <>
    <Helmet><title>404 – Page Not Found</title></Helmet>
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-accent font-heading">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mt-4 mb-2">Page not found</h2>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/shop" className="btn-outline">Browse Shop</Link>
        </div>
      </div>
    </div>
  </>
);

export default NotFound;
