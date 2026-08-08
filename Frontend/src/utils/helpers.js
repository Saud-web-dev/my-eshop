// Format currency
export const formatCurrency = (amount, currency = 'PKR', symbol = '₨') => {
  if (amount == null) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString('en-PK')}`;
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric', ...options,
  });
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Truncate text
export const truncate = (text, max = 100) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
};

// Generate slug
export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Get error message from axios error
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong.';

// Build query string
export const buildQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

// Discount percentage
export const discountPercent = (original, sale) => {
  if (!original || !sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

// Avatar initials
export const getInitials = (name = '') => {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

// Is valid ObjectId
export const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// Is an offer/entity currently within its active schedule
export const isActiveNow = (item, now = new Date()) => {
  if (!item) return false;
  if (item.isActive === false) return false;
  const start = item.startDate ? new Date(item.startDate) : null;
  const end = item.endDate ? new Date(item.endDate) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
};
