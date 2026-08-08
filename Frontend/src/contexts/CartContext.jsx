import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_KEY = 'zf_cart';

const load = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity = 1, variant } = action.payload;
      const key = variant ? `${product._id}-${variant.value}` : product._id;
      const existing = state.find(i => i.key === key);
      if (existing) {
        return state.map(i =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const price = product.salePrice || product.price;
      return [...state, { key, product, quantity, variant, price }];
    }
    case 'REMOVE':
      return state.filter(i => i.key !== action.payload);
    case 'UPDATE_QTY':
      return state.map(i =>
        i.key === action.payload.key ? { ...i, quantity: Math.max(1, action.payload.quantity) } : i
      );
    case 'CLEAR':
      return [];
    case 'LOAD':
      return action.payload;
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, [], load);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    dispatch({ type: 'ADD', payload: { product, quantity, variant } });
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((key) => {
    dispatch({ type: 'REMOVE', payload: key });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  // Derived values
  const itemCount  = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty    = items.length === 0;

  const isInCart = useCallback(
    (productId) => items.some(i => i.product._id === productId),
    [items]
  );

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      isEmpty,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
