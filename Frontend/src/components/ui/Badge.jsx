import { clsx } from 'clsx';

const variants = {
  default:  'bg-surface-overlay text-text-secondary',
  primary:  'bg-primary-100 text-primary-800',
  success:  'bg-green-100 text-green-700',
  warning:  'bg-yellow-100 text-yellow-700',
  danger:   'bg-red-100 text-red-700',
  accent:   'bg-accent/10 text-accent',
  info:     'bg-blue-100 text-blue-700',
};

const orderStatusVariants = {
  pending:           'warning',
  confirmed:         'info',
  processing:        'info',
  shipped:           'primary',
  out_for_delivery:  'primary',
  delivered:         'success',
  cancelled:         'danger',
  return_requested:  'warning',
  returned:          'default',
  refunded:          'danger',
};

const Badge = ({ children, variant = 'default', dot = false, className }) => (
  <span className={clsx('badge', variants[variant] ?? variants.default, className)}>
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', {
      'bg-green-500':  variant === 'success',
      'bg-yellow-500': variant === 'warning',
      'bg-red-500':    variant === 'danger',
      'bg-blue-500':   variant === 'info',
      'bg-accent':     variant === 'accent',
      'bg-primary-600':variant === 'primary',
      'bg-gray-400':   variant === 'default',
    })} />}
    {children}
  </span>
);

export const OrderStatusBadge = ({ status }) => {
  const variant = orderStatusVariants[status] || 'default';
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return <Badge variant={variant} dot>{label}</Badge>;
};

export const StockBadge = ({ stock }) => {
  if (stock === 0) return <Badge variant="danger">Out of Stock</Badge>;
  if (stock <= 5)  return <Badge variant="warning">Low Stock ({stock})</Badge>;
  return <Badge variant="success">In Stock ({stock})</Badge>;
};

export default Badge;
