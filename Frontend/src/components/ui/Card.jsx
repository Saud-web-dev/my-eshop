import { clsx } from 'clsx';

const Card = ({ children, className, padding = true, hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-surface rounded-card border border-border',
      padding && 'p-5',
      hover && 'hover:shadow-card-hover transition-shadow duration-300 cursor-pointer',
      !hover && 'shadow-card',
      className
    )}
  >
    {children}
  </div>
);

export const StatCard = ({ icon, label, value, change, changeType = 'up', loading }) => (
  <Card className="flex items-start gap-4">
    <div className="shrink-0 p-3 rounded-xl bg-accent/10 text-accent text-2xl">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-text-muted font-medium truncate">{label}</p>
      {loading ? (
        <div className="h-7 w-24 skeleton mt-1 rounded" />
      ) : (
        <p className="text-2xl font-bold text-text-primary mt-0.5">{value}</p>
      )}
      {change !== undefined && !loading && (
        <p className={clsx(
          'text-xs font-medium mt-1 flex items-center gap-1',
          changeType === 'up' ? 'text-green-600' : 'text-red-500'
        )}>
          {changeType === 'up' ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </p>
      )}
    </div>
  </Card>
);

export const ProductCard = ({ product, onAddToCart, onWishlist, isWishlisted }) => {
  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden aspect-square bg-surface-overlay">
        <img
          src={product.images?.[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </span>
        )}
        {product.isNewArrival && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => onAddToCart?.(product)}
            className="w-full btn-primary text-xs py-2"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-text-muted mb-1">{product.category?.name}</p>
        <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-accent">₨{price?.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-text-muted line-through">₨{product.price?.toLocaleString()}</span>
          )}
        </div>
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(product.averageRating))}</span>
            <span className="text-xs text-text-muted">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
