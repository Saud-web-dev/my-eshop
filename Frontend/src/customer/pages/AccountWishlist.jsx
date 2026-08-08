import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authAPI } from '@services/api';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@contexts/CartContext';
import { formatCurrency } from '@utils/helpers';
import Spinner from '@components/ui/Spinner';
import { StockBadge } from '@components/ui/Badge';
import { MdFavorite, MdDeleteOutline, MdShoppingCart, MdFlashOn, MdStar } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AccountWishlist = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => authAPI.getWishlist(),
    select: d => d.data.data,
  });

  const removeItem = async (productId) => {
    try {
      await authAPI.toggleWishlist({ productId });
      toast.success('Removed from wishlist');
      qc.invalidateQueries({ queryKey: ['my-wishlist'] });
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleDirectOrder = (product) => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    const singleItem = {
      product,
      quantity: 1,
      variant: null,
      price: product.salePrice || product.price,
      key: `${product._id}-default`,
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(singleItem));
    navigate('/checkout?buyNow=1');
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <div className="bg-surface border border-border rounded-card p-12 text-center">
        <MdFavorite size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="font-semibold text-text-primary mb-2">Your wishlist is empty</h3>
        <p className="text-text-muted text-sm mb-6">Save your favourite fragrances and find them here.</p>
        <Link to="/shop" className="btn-primary">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">My Wishlist</h2>
        <span className="text-sm text-text-muted">{wishlist.length} item(s)</span>
      </div>

      <div className="divide-y divide-border">
        {wishlist.map(p => (
          <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-surface-raised/50 transition-colors">
            <Link to={`/product/${p.slug || p._id}`} className="shrink-0">
              <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name}
                className="w-20 h-20 rounded-xl object-cover border border-border" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/product/${p.slug || p._id}`}
                className="font-semibold text-text-primary hover:text-accent transition-colors line-clamp-1 text-sm">
                {p.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-accent">{formatCurrency(p.salePrice || p.price)}</span>
                {p.salePrice && p.salePrice < p.price && (
                  <span className="text-xs text-text-muted line-through">{formatCurrency(p.price)}</span>
                )}
              </div>
              {p.averageRating > 0 && (
                <p className="text-xs text-yellow-500 flex items-center gap-0.5 mt-0.5">
                  <MdStar size={12} /> {p.averageRating.toFixed(1)} ({p.reviewCount} reviews)
                </p>
              )}
              <div className="mt-1"><StockBadge stock={p.stock} /></div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={() => handleDirectOrder(p)}
                disabled={p.stock === 0}
                className="btn-primary px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                <MdFlashOn size={14} /> Direct Order
              </button>
              <button
                onClick={() => addToCart(p, 1, null)}
                disabled={p.stock === 0}
                className="btn-outline px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                <MdShoppingCart size={14} /> Add to Cart
              </button>
              <button onClick={() => removeItem(p._id)}
                className="p-2 rounded-btn border border-border text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
                aria-label="Remove from wishlist">
                <MdDeleteOutline size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountWishlist;
