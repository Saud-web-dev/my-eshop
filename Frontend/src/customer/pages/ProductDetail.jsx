import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { productAPI, reviewAPI, authAPI } from '@services/api';
import { useCart } from '@contexts/CartContext';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { formatCurrency, discountPercent, getErrorMessage } from '@utils/helpers';
import Spinner from '@components/ui/Spinner';
import Badge, { StockBadge } from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { Textarea } from '@components/ui/Input';
import { MdStar, MdFavorite, MdShoppingCart, MdFlashOn } from 'react-icons/md';
import toast from 'react-hot-toast';

// ── Star Rating Input ──────────────────────────────────────────────────────
const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className={`text-2xl transition-colors ${s <= value ? 'text-yellow-400' : 'text-border hover:text-yellow-300'}`}>
        ★
      </button>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || '';
  const qc = useQueryClient();

  const [qty, setQty]                     = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [tab, setTab]                     = useState('description');
  const [reviewModal, setReviewModal]     = useState(false);
  const [rating, setRating]               = useState(5);
  const [comment, setComment]             = useState('');
  const [reviewTitle, setReviewTitle]     = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getOne(id),
    select: d => d.data.data,
  });

  const targetId = product?._id || id;

  // Always fetch reviews (not gated by tab) so they are ready
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', targetId],
    queryFn: () => reviewAPI.getProductReviews(targetId, { limit: 20 }),
    select: d => d.data.data,
    enabled: !!targetId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewAPI.create(data),
    onSuccess: () => {
      toast.success('Review submitted! It is now live on this product.');
      setReviewModal(false);
      setRating(5); setComment(''); setReviewTitle('');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    addToCart(product, qty, selectedVariant);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    const singleItem = {
      product,
      quantity: qty,
      variant: selectedVariant,
      price: product.salePrice || product.price,
      key: `${product._id}-${selectedVariant?.value || 'default'}`,
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(singleItem));
    navigate('/checkout?buyNow=1');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await authAPI.toggleWishlist({ productId: product._id });
      toast.success('Wishlist updated');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const submitReview = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!comment.trim()) { toast.error('Please write a review comment.'); return; }
    const fd = new FormData();
    fd.append('productId', product._id || id);
    fd.append('rating', rating);
    fd.append('title', reviewTitle);
    fd.append('comment', comment);
    reviewMutation.mutate(fd);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );

  if (error || !product) return (
    <div className="container-custom py-20 text-center">
      <p className="text-text-muted text-lg mb-4">Product not found.</p>
      <Link to="/shop" className="btn-primary">Back to Shop</Link>
    </div>
  );

  const effectivePrice = product.salePrice || product.price;
  const discount = discountPercent(product.price, product.salePrice);
  const totalReviewCount = reviews?.length ?? product.reviewCount ?? 0;

  return (
    <>
      <Helmet>
        <title>{product.name}{storeName ? ` – ${storeName}` : ''}</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 160) || ''} />
      </Helmet>

      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-accent">Shop</Link>
          {product.category && <>
            <span>/</span>
            <Link to={`/shop?category=${product.category._id}`} className="hover:text-accent">{product.category.name}</Link>
          </>}
          <span>/</span>
          <span className="text-text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-overlay border border-border">
              <motion.img
                key={selectedImage}
                src={product.images?.[selectedImage]?.url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-accent' : 'border-border hover:border-accent/50'
                    }`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Labels */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.isNewArrival  && <Badge variant="success">New Arrival</Badge>}
              {product.isBestSeller  && <Badge variant="primary">Best Seller</Badge>}
              {product.isTrending    && <Badge variant="info">Trending</Badge>}
              {product.isFlashSale   && <Badge variant="accent">Flash Sale</Badge>}
              <StockBadge stock={product.stock} />
            </div>

            <div>
              {product.category && (
                <Link to={`/shop?category=${product.category._id}`}
                  className="text-sm text-accent hover:underline mb-1 block">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-text-primary font-heading leading-tight">{product.name}</h1>
              {product.brand && <p className="text-sm text-text-muted mt-1">by {product.brand}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(s => (
                  <MdStar key={s} size={18} className={s <= Math.round(product.averageRating || 0) ? '' : 'opacity-30'} />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No ratings yet'} ({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-accent">{formatCurrency(effectivePrice)}</span>
              {product.salePrice && product.salePrice < product.price && (
                <>
                  <span className="text-xl text-text-muted line-through">{formatCurrency(product.price)}</span>
                  <Badge variant="accent">{discount}% OFF</Badge>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-text-secondary leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button key={i} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-btn border text-sm font-medium transition-colors ${
                        selectedVariant?.value === v.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent text-text-secondary'
                      }`}>
                      {v.name}: {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Wishlist */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-btn overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-surface-overlay text-lg font-bold transition-colors">−</button>
                <span className="px-5 py-3 text-text-primary font-medium min-w-[50px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 hover:bg-surface-overlay text-lg font-bold transition-colors">+</button>
              </div>
              <button onClick={handleWishlist}
                className="p-3 rounded-btn border border-border hover:border-accent hover:text-accent transition-colors">
                <MdFavorite size={20} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="btn-outline flex-1 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                <MdShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {product.stock > 0 && (
                <button onClick={handleBuyNow}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  <MdFlashOn size={18} />
                  Direct Order
                </button>
              )}
            </div>
            {product.stock > 0 && (
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MdFlashOn size={13} className="text-accent" />
                Direct Order skips the cart — place this single item order instantly.
              </p>
            )}

            {product.sku && <p className="text-xs text-text-muted">SKU: {product.sku}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-border flex gap-8">
            {['description', 'reviews'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'
                }`}>
                {t}{t === 'reviews' && (reviews?.length ?? 0) > 0 ? ` (${reviews.length})` : ''}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === 'description' && (
              <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
            )}

            {tab === 'reviews' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-text-primary text-lg">
                    {(reviews?.length ?? 0) > 0 ? `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}` : 'Customer Reviews'}
                  </h3>
                  {isAuthenticated ? (
                    <Button onClick={() => setReviewModal(true)} variant="outline">
                      Write a Review
                    </Button>
                  ) : (
                    <Link to="/login" className="btn-outline text-sm">
                      Login to Review
                    </Link>
                  )}
                </div>

                {/* Reviews list */}
                {reviewsLoading ? (
                  <div className="text-center py-8"><Spinner size="lg" /></div>
                ) : !reviews?.length ? (
                  <div className="text-center py-12 text-text-muted">
                    <MdStar size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-lg mb-2">No reviews yet.</p>
                    {isAuthenticated
                      ? <p className="text-sm">Be the first to review this product!</p>
                      : <p className="text-sm"><Link to="/login" className="text-accent hover:underline">Login</Link> to write a review.</p>
                    }
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <motion.div key={r._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-raised rounded-card p-5 border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {r.user?.avatar?.url
                              ? <img src={r.user.avatar.url} alt={r.user.name} className="w-9 h-9 rounded-full object-cover" />
                              : <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                                  {r.user?.name?.[0] || 'U'}
                                </div>
                            }
                            <div>
                              <p className="font-semibold text-sm text-text-primary">{r.user?.name || 'Anonymous'}</p>
                              <div className="flex text-yellow-400 text-sm">
                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </div>
                            </div>
                          </div>
                          {r.isVerifiedPurchase && <Badge variant="success" dot>Verified Purchase</Badge>}
                        </div>
                        {r.title && <p className="font-medium text-text-primary mb-1">{r.title}</p>}
                        <p className="text-sm text-text-secondary">{r.comment}</p>
                        {r.adminReply?.comment && (
                          <div className="mt-3 pl-4 border-l-2 border-accent bg-accent/5 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-accent mb-1">Store Reply</p>
                            <p className="text-sm text-text-secondary">{r.adminReply.comment}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)}
        title="Write a Review" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button onClick={submitReview} loading={reviewMutation.isPending}>Submit Review</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Your Rating *</p>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">Title (optional)</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={e => setReviewTitle(e.target.value)}
              placeholder="Summary of your review"
              className="input-base"
            />
          </div>
          <Textarea
            label="Your Review *"
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this product…"
          />
        </div>
      </Modal>
    </>
  );
};

export default ProductDetail;
