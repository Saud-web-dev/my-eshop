import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@contexts/CartContext';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { orderAPI, couponAPI } from '@services/api';
import { checkoutSchema } from '@utils/validators';
import { formatCurrency, getErrorMessage } from '@utils/helpers';
import Input, { Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdCheckCircle, MdLocalOffer, MdLocalShipping, MdLocationOn } from 'react-icons/md';
import { Link } from 'react-router-dom';

// Only Cash on Delivery — all online payment options are intentionally removed
const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay with cash when your order arrives at your doorstep.' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, subtotal, clearCart, isEmpty } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Your Store';

  const isBuyNow = searchParams.get('buyNow') === '1';

  // Direct-order item stored on product detail / cart page
  const buyNowItem = (() => {
    try { return JSON.parse(sessionStorage.getItem('buyNowItem')); }
    catch { return null; }
  })();

  const checkoutItems = isBuyNow && buyNowItem ? [buyNowItem] : items;
  const checkoutSubtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const checkoutItemCount = checkoutItems.reduce((sum, i) => sum + i.quantity, 0);
  const checkoutEmpty = checkoutItems.length === 0;

  const [couponCode, setCouponCode]   = useState('');
  const [couponData, setCouponData]   = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        fullName: user?.name || '',
        country: 'Pakistan',
      },
      paymentMethod: 'cod',
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-24 text-center">
        <p className="text-text-muted text-lg mb-4">Please log in to checkout.</p>
        <Link to="/login?redirect=/checkout" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (checkoutEmpty && !success) {
    return (
      <div className="container-custom py-24 text-center">
        <p className="text-text-muted text-lg mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-custom py-24 max-w-lg text-center">
        <MdCheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Order Placed!</h2>
        <p className="text-text-muted mb-1">Order #{success.orderNumber}</p>
        <p className="text-text-muted mb-6">You'll receive a confirmation email shortly. Pay with Cash on Delivery when your order arrives.</p>
        <Link to="/account/orders" className="btn-primary mr-3">View Orders</Link>
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode, cartTotal: checkoutSubtotal });
      setCouponData(data.coupon);
      toast.success(`Coupon applied! You save ${formatCurrency(data.coupon.discount)}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const discount  = couponData?.discount || 0;
  const total     = Math.max(0, checkoutSubtotal - discount);

  // Fill the shipping form from a saved address
  const fillSavedAddress = (addrId) => {
    const addr = user?.addresses?.find(a => a._id === addrId);
    if (!addr) return;
    setValue('shippingAddress', {
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Pakistan',
    });
  };

  const onSubmit = async (form) => {
    setSubmitting(true);
    try {
      const payload = {
        items: checkoutItems.map(i => ({ product: i.product._id, quantity: i.quantity, variant: i.variant })),
        shippingAddress: form.shippingAddress,
        paymentMethod: 'cod',
        couponCode: couponData ? couponCode : undefined,
      };
      const { data } = await orderAPI.create(payload);
      if (isBuyNow) {
        sessionStorage.removeItem('buyNowItem');
      } else {
        clearCart();
      }
      setSuccess(data.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Checkout – {storeName}</title></Helmet>
      <div className="container-custom py-10">
        <h1 className="text-2xl font-bold text-text-primary font-heading mb-8">
          {isBuyNow ? 'Direct Order Checkout' : 'Checkout'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-surface border border-border rounded-card p-6">
                <h2 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                  <MdLocationOn className="text-accent" size={18} /> Shipping Address
                </h2>

                {user?.addresses?.length > 0 && (
                  <div className="mb-5">
                    <Select label="Use a saved address" onChange={e => fillSavedAddress(e.target.value)}>
                      <option value="">— Choose a saved address —</option>
                      {user.addresses.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.label}: {a.addressLine1}, {a.city}{a.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" required error={errors.shippingAddress?.fullName?.message}
                    {...register('shippingAddress.fullName')} />
                  <Input label="Phone Number" required type="tel" error={errors.shippingAddress?.phone?.message}
                    {...register('shippingAddress.phone')} />
                  <Input label="Address Line 1" required wrapperClassName="sm:col-span-2"
                    error={errors.shippingAddress?.addressLine1?.message}
                    {...register('shippingAddress.addressLine1')} />
                  <Input label="Address Line 2 (optional)"
                    {...register('shippingAddress.addressLine2')} />
                  <Input label="City" required error={errors.shippingAddress?.city?.message}
                    {...register('shippingAddress.city')} />
                  <Input label="State / Province" required error={errors.shippingAddress?.state?.message}
                    {...register('shippingAddress.state')} />
                  <Input label="Postal Code" required error={errors.shippingAddress?.postalCode?.message}
                    {...register('shippingAddress.postalCode')} />
                  <Input label="Country" defaultValue="Pakistan" {...register('shippingAddress.country')} />
                </div>
              </div>

              {/* Payment — Cash on Delivery only */}
              <div className="bg-surface border border-border rounded-card p-6">
                <h2 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                  <MdLocalShipping className="text-accent" size={18} /> Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.value} className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-accent bg-accent/5 transition-colors">
                      <input type="radio" value={m.value} defaultChecked {...register('paymentMethod')} className="accent-accent mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium text-text-primary">{m.label}</span>
                        <span className="block text-xs text-text-muted mt-0.5">{m.desc}</span>
                      </span>
                    </label>
                  ))}
                  <p className="text-xs text-text-muted flex items-center gap-1.5">
                    <MdCheckCircle className="text-green-500" size={14} />
                    No advance payment needed. Cash on Delivery is the only available option.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-card p-6 sticky top-24 space-y-5">
                <h3 className="font-bold text-text-primary">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {checkoutItems.map(item => (
                    <div key={item.key} className="flex items-center gap-3">
                      <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-text-muted">x{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-accent">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <MdLocalOffer size={16} className="text-accent" /> Coupon Code
                  </p>
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="input-base flex-1 text-sm uppercase" />
                    <Button type="button" onClick={applyCoupon} loading={couponLoading} size="sm" variant="outline">Apply</Button>
                  </div>
                  {couponData && (
                    <p className="text-xs text-green-600 mt-1.5">✓ Coupon applied! You save {formatCurrency(couponData.discount)}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal ({checkoutItemCount} items)</span><span>{formatCurrency(checkoutSubtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>- {formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span><span className="text-green-600 font-medium">Calculated at delivery</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-text-primary pt-2 border-t border-border">
                    <span>Total (Cash on Delivery)</span>
                    <span className="text-accent text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button type="submit" fullWidth loading={submitting} size="lg">
                  {isBuyNow ? 'Place Direct Order' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Checkout;
