// import { Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Helmet } from 'react-helmet-async';
// import { useCart } from '@contexts/CartContext';
// import { useTheme } from '@contexts/ThemeContext';
// import { formatCurrency } from '@utils/helpers';
// import { MdAdd, MdRemove, MdDeleteOutline, MdShoppingCart } from 'react-icons/md';

// const Cart = () => {
//   const { items, itemCount, subtotal, isEmpty, removeFromCart, updateQuantity, clearCart } = useCart();
//   const { storeSettings } = useTheme();
//   const storeName = storeSettings?.storeName || 'Your Store';

//   if (isEmpty) return (
//     <>
//       <Helmet><title>Cart – {storeName}</title></Helmet>
//       <div className="container-custom py-24 text-center">
//         <MdShoppingCart size={64} className="mx-auto text-text-muted mb-6" />
//         <h2 className="text-2xl font-bold text-text-primary mb-2">Your cart is empty</h2>
//         <p className="text-text-muted mb-8">Explore our collection and add your favourite fragrances.</p>
//         <Link to="/shop" className="btn-primary">Shop Now</Link>
//       </div>
//     </>
//   );

//   return (
//     <>
//       <Helmet><title>Cart ({itemCount}) – {storeName}</title></Helmet>
//       <div className="container-custom py-10">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-2xl font-bold text-text-primary font-heading">
//             Your Cart <span className="text-text-muted font-normal text-lg">({itemCount} items)</span>
//           </h1>
//           <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 transition-colors">
//             Clear Cart
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Items */}
//           <div className="lg:col-span-2 space-y-4">
//             <AnimatePresence>
//               {items.map(item => (
//                 <motion.div key={item.key}
//                   layout
//                   initial={{ opacity: 0, y: 16 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, x: -32, height: 0 }}
//                   className="flex gap-4 bg-surface border border-border rounded-card p-4">
//                   <Link to={`/product/${item.product.slug || item.product._id}`}
//                     className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border">
//                     <img src={item.product.images?.[0]?.url || '/placeholder.jpg'}
//                       alt={item.product.name} className="w-full h-full object-cover" />
//                   </Link>

//                   <div className="flex-1 min-w-0">
//                     <Link to={`/product/${item.product.slug || item.product._id}`}
//                       className="font-semibold text-text-primary hover:text-accent transition-colors line-clamp-2 text-sm">
//                       {item.product.name}
//                     </Link>
//                     {item.variant && (
//                       <p className="text-xs text-text-muted mt-0.5">{item.variant.name}: {item.variant.value}</p>
//                     )}
//                     <p className="text-sm text-text-muted mt-0.5">{item.product.category?.name}</p>

//                     <div className="flex items-center justify-between mt-3">
//                       <div className="flex items-center border border-border rounded-btn overflow-hidden">
//                         <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
//                           className="p-1.5 hover:bg-surface-overlay transition-colors">
//                           <MdRemove size={14} />
//                         </button>
//                         <span className="px-3 text-sm font-medium">{item.quantity}</span>
//                         <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
//                           className="p-1.5 hover:bg-surface-overlay transition-colors">
//                           <MdAdd size={14} />
//                         </button>
//                       </div>

//                       <div className="flex items-center gap-4">
//                         <span className="font-bold text-accent">
//                           {formatCurrency(item.price * item.quantity)}
//                         </span>
//                         <button onClick={() => removeFromCart(item.key)}
//                           className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
//                           <MdDeleteOutline size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>

//           {/* Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-surface border border-border rounded-card p-6 sticky top-24 space-y-5">
//               <h3 className="font-bold text-text-primary text-lg">Order Summary</h3>

//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between text-text-secondary">
//                   <span>Subtotal ({itemCount} items)</span>
//                   <span>{formatCurrency(subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between text-text-secondary">
//                   <span>Shipping</span>
//                   <span className="text-green-600 font-medium">Calculated at checkout</span>
//                 </div>
//               </div>

//               <div className="border-t border-border pt-4">
//                 <div className="flex justify-between font-bold text-lg text-text-primary">
//                   <span>Total</span>
//                   <span className="text-accent">{formatCurrency(subtotal)}</span>
//                 </div>
//               </div>

//               <Link to="/checkout" className="btn-primary w-full text-center block py-3">
//                 Proceed to Checkout
//               </Link>
//               <Link to="/shop" className="btn-ghost w-full text-center block border border-border">
//                 Continue Shopping
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;

import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@contexts/CartContext';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { formatCurrency } from '@utils/helpers';
import {
  MdAdd,
  MdRemove,
  MdDeleteOutline,
  MdShoppingCart,
  MdFlashOn,
} from 'react-icons/md';

const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    isEmpty,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Your Store';

  // FIX: Ensure itemCount is always a number
  const totalItems = itemCount || 0;

  // Direct order for a single cart item (skips the rest of the cart)
  const handleBuyNow = (item) => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    const singleItem = {
      product: item.product,
      quantity: item.quantity,
      variant: item.variant,
      price: item.price,
      key: item.key,
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(singleItem));
    navigate('/checkout?buyNow=1');
  };

  if (isEmpty)
    return (
      <>
        <Helmet>
          <title>{`Cart – ${storeName}`}</title>
        </Helmet>
        <div className="container-custom py-24 text-center">
          <MdShoppingCart size={64} className="mx-auto text-text-muted mb-6" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Your cart is empty
          </h2>
          <p className="text-text-muted mb-8">
            Explore our collection and add your favourite fragrances.
          </p>
          <Link to="/shop" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </>
    );

  return (
    <>
      <Helmet>
        {/* FIX: Use template literal with fallback value */}
        <title>{`Cart (${totalItems}) – ${storeName}`}</title>
      </Helmet>
      <div className="container-custom py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary font-heading">
            Your Cart{' '}
            <span className="text-text-muted font-normal text-lg">
              ({totalItems} items)
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -32, height: 0 }}
                  className="flex gap-4 bg-surface border border-border rounded-card p-4"
                >
                  <Link
                    to={`/product/${item.product.slug || item.product._id}`}
                    className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border"
                  >
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug || item.product._id}`}
                      className="font-semibold text-text-primary hover:text-accent transition-colors line-clamp-2 text-sm"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-sm text-text-muted mt-0.5">
                      {item.product.category?.name}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-btn overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-surface-overlay transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <MdRemove size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-surface-overlay transition-colors"
                          aria-label="Increase quantity"
                        >
                          <MdAdd size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-accent">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Single-item direct order */}
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-accent border border-accent/40 hover:bg-accent hover:text-white rounded-btn px-3 py-1.5 transition-colors"
                    >
                      <MdFlashOn size={14} />
                      Direct Order This Item
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-card p-6 sticky top-24 space-y-5">
              <h3 className="font-bold text-text-primary text-lg">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-bold text-lg text-text-primary">
                  <span>Total</span>
                  <span className="text-accent">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full text-center block py-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/shop"
                className="btn-ghost w-full text-center block border border-border"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;