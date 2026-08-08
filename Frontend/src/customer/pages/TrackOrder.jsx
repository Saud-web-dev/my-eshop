import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { orderAPI, contentPageAPI } from '@services/api';
import { useTheme } from '@contexts/ThemeContext';
import { formatCurrency, formatDateTime, getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { OrderStatusBadge } from '@components/ui/Badge';
import { PageSpinner } from '@components/ui/Spinner';
import { MdChevronRight, MdTrackChanges } from 'react-icons/md';

const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const TrackOrder = () => {
  const { storeSettings } = useTheme();
  const storeName = storeSettings?.storeName || 'Your Store';
  const [submitted, setSubmitted] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { orderId: '', email: '' },
  });

  const { data: pageData } = useQuery({
    queryKey: ['page', 'track-order'],
    queryFn: () => contentPageAPI.getOne('track-order'),
    select: d => d.data.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: result, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['track-order', submitted?.orderId, submitted?.email],
    queryFn: () => orderAPI.trackOrder(submitted),
    select: d => d.data.data,
    enabled: !!submitted,
    retry: false,
  });

  const onSubmit = (d) => setSubmitted({ orderId: d.orderId.trim(), email: d.email.trim() || undefined });

  const currentIdx = result ? ORDER_FLOW.indexOf(result.status) : -1;
  const cancelled = result?.status === 'cancelled';

  const pageTitle = pageData?.title || 'Track Your Order';

  return (
    <>
      <Helmet><title>{pageData?.metaTitle || `Track Order – ${storeName}`}</title></Helmet>

      <div className="container-custom py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <MdChevronRight size={14} />
          <span className="text-text-secondary font-medium">Track Order</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2">{pageTitle}</h1>
          <div className="w-16 h-1 bg-accent rounded-full mb-8" />

          {/* Search form */}
          <div className="bg-surface border border-border rounded-card p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Order Number" required placeholder="e.g. ZF-123456"
                  error={errors.orderId?.message}
                  {...register('orderId', { required: 'Order number is required' })} />
                <Input label="Email (optional)" type="email" placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  hint="Only required if you ordered as a guest." />
              </div>
              <Button type="submit" loading={isFetching} icon={<MdTrackChanges size={16} />}>
                Track Order
              </Button>
            </form>
          </div>

          {/* Result */}
          {isLoading && submitted && <div className="min-h-[20vh]"><PageSpinner /></div>}

          {isError && submitted && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-card p-6 text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">{getErrorMessage(error)}</p>
              <p className="text-sm text-text-muted mt-2">Double-check your order number and try again.</p>
            </div>
          )}

          {result && !isError && (
            <div className="bg-surface border border-border rounded-card overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-text-muted">Order</p>
                  <p className="font-mono font-bold text-text-primary">{result.orderNumber}</p>
                  <p className="text-xs text-text-muted mt-1">Placed on {formatDateTime(result.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Status</p>
                  <OrderStatusBadge status={result.status} />
                </div>
              </div>

              {/* Progress tracker */}
              {!cancelled ? (
                <div className="p-6">
                  <div className="flex items-center">
                    {ORDER_FLOW.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold
                          ${i <= currentIdx ? 'bg-accent border-accent text-white' : 'border-border text-text-muted'}`}>
                          {i < currentIdx ? '✓' : i + 1}
                        </div>
                        {i < ORDER_FLOW.length - 1 && (
                          <div className={`absolute top-2.5 left-1/2 w-full h-0.5 ${i < currentIdx ? 'bg-accent' : 'bg-border'}`} />
                        )}
                        <span className={`mt-2 text-[10px] font-medium capitalize text-center ${i <= currentIdx ? 'text-accent' : 'text-text-muted'}`}>
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="font-medium text-red-500">This order was cancelled.</p>
                </div>
              )}

              {/* Items */}
              <div className="border-t border-border divide-y divide-border">
                {result.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    {it.image
                      ? <img src={it.image} alt={it.name} className="w-14 h-14 object-cover rounded-lg border border-border" />
                      : <div className="w-14 h-14 rounded-lg bg-surface-overlay" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{it.name}</p>
                      <p className="text-xs text-text-muted">Qty: {it.quantity}</p>
                    </div>
                    <p className="font-semibold text-text-primary">{formatCurrency(it.price * it.quantity, storeSettings?.currency, storeSettings?.currencySymbol)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border p-6 space-y-1.5 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatCurrency(result.subtotal, storeSettings?.currency, storeSettings?.currencySymbol)}</span>
                </div>
                {result.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(result.discount, storeSettings?.currency, storeSettings?.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>{result.shippingCost > 0 ? formatCurrency(result.shippingCost, storeSettings?.currency, storeSettings?.currencySymbol) : 'Free'}</span>
                </div>
                <div className="flex justify-between font-bold text-text-primary text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(result.total, storeSettings?.currency, storeSettings?.currencySymbol)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackOrder;
