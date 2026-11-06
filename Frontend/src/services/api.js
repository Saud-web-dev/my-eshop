import api from './axiosInstance';

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  checkAdminExists: ()              => api.get('/auth/check-admin'),
  adminRegister:  (data)            => api.post('/auth/admin-register', data),
  register:     (data)            => api.post('/auth/register', data),
  verifyOTP:    (data)            => api.post('/auth/verify-otp', data),
  resendOTP:    (data)            => api.post('/auth/resend-otp', data),
  login:        (data)            => api.post('/auth/login', data),
  googleAuth:   (data)            => api.post('/auth/google', data),
  logout:       ()                => api.post('/auth/logout'),
  refreshToken: ()                => api.post('/auth/refresh-token'),
  getMe:        ()                => api.get('/auth/me'),
  updateProfile:(data)            => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword:(data)           => api.put('/auth/change-password', data),
  forgotPassword:(data)           => api.post('/auth/forgot-password', data),
  resetPassword: (data)           => api.post('/auth/reset-password', data),
  toggleWishlist:(data)           => api.post('/auth/wishlist', data),
  getWishlist:    ()              => api.get('/auth/wishlist'),
  addAddress:   (data)            => api.post('/auth/addresses', data),
  updateAddress:(id, data)        => api.put(`/auth/addresses/${id}`, data),
  setDefaultAddress:(id)          => api.patch(`/auth/addresses/${id}/default`),
  deleteAddress:(id)              => api.delete(`/auth/addresses/${id}`),
  deleteAccount:()                => api.delete('/auth/account'),
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:         (params)        => api.get('/products', { params }),
  getOne:         (id)            => api.get(`/products/${id}`),
  create:         (data)          => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkImport:     (items)         => api.post('/products/bulk-import', { items }),
  update:         (id, data)      => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:         (id)            => api.delete(`/products/${id}`),
  restore:        (id)            => api.patch(`/products/${id}/restore`),
  toggleStatus:   (id)            => api.patch(`/products/${id}/toggle-status`),
  deleteImage:    (id, publicId)  => api.delete(`/products/${id}/images/${encodeURIComponent(publicId)}`),
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll:   (params)     => api.get('/categories', { params }),
  getOne:   (id)         => api.get(`/categories/${id}`),
  create:   (data)       => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkImport: (items)    => api.post('/categories/bulk-import', { items }),
  update:   (id, data)   => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:   (id)         => api.delete(`/categories/${id}`),
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:          (data)          => api.post('/orders', data),
  trackOrder:      (data)          => api.post('/orders/track', data),
  getMyOrders:     (params)        => api.get('/orders/my-orders', { params }),
  getOne:          (id)            => api.get(`/orders/${id}`),
  cancel:          (id, data)      => api.patch(`/orders/${id}/cancel`, data),
  requestReturn:   (id, data)      => api.post(`/orders/${id}/return`, data),
  // Admin
  adminGetAll:     (params)        => api.get('/orders', { params }),
  updateStatus:    (id, data)      => api.patch(`/orders/${id}/status`, data),
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getMyReviews:      (params)           => api.get('/reviews/my-reviews', { params }),
  create:            (data)              => api.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  voteHelpful:       (id)                => api.patch(`/reviews/${id}/helpful`),
  report:            (id)                => api.post(`/reviews/${id}/report`),
  // Admin
  adminGetAll:       (params)            => api.get('/reviews', { params }),
  moderate:          (id, data)          => api.patch(`/reviews/${id}/moderate`, data),
};

// ─── COUPONS ─────────────────────────────────────────────────────────────────
export const couponAPI = {
  validate: (data)        => api.post('/coupons/validate', data),
  // Admin
  getAll:   ()            => api.get('/coupons'),
  create:   (data)        => api.post('/coupons', data),
  update:   (id, data)    => api.put(`/coupons/${id}`, data),
  delete:   (id)          => api.delete(`/coupons/${id}`),
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const settingsAPI = {
  getSettings:      ()       => api.get('/settings'),
  sendContact:      (data)   => api.post('/settings/contact', data),
  updateSettings:   (data)   => api.put('/settings', data),
  uploadLogo:       (data)   => api.post('/settings/logo', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanners:    (data)   => api.post('/settings/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadHeroImage:  (data)   => api.post('/settings/hero', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteHeroImage:  (publicId) => api.delete(`/settings/hero/${encodeURIComponent(publicId)}`),
  uploadAboutImage: (data)   => api.post('/settings/about-image', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  completeSetup:    (data)   => api.post('/settings/setup', data),
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard:       ()  => api.get('/analytics/dashboard'),
  getRevenueChart:    ()  => api.get('/analytics/revenue-chart'),
  getTopProducts:     ()  => api.get('/analytics/top-products'),
  getRecentOrders:    ()  => api.get('/analytics/recent-orders'),
  getRecentCustomers: ()  => api.get('/analytics/recent-customers'),
  getOrdersByStatus:  ()  => api.get('/analytics/orders-by-status'),
  getTopCategories:   ()  => api.get('/analytics/top-categories'),
  getAllCustomers:     (params) => api.get('/analytics/customers', { params }),
};

// ─── FAQS ────────────────────────────────────────────────────────────────────
export const faqAPI = {
  getAll: (params)      => api.get('/faqs', { params }),
  // Admin
  create: (data)        => api.post('/faqs', data),
  update: (id, data)    => api.put(`/faqs/${id}`, data),
  delete: (id)          => api.delete(`/faqs/${id}`),
};

// ─── CONTENT PAGES ───────────────────────────────────────────────────────────
export const contentPageAPI = {
  getAll: (params)      => api.get('/pages', { params }),
  getOne: (slug)        => api.get(`/pages/${slug}`),
  // Admin
  create: (data)        => api.post('/pages', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data)    => api.put(`/pages/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id)          => api.delete(`/pages/${id}`),
};

// ─── OFFERS / SALES ──────────────────────────────────────────────────────────
export const offerAPI = {
  getAll: (params)      => api.get('/offers', { params }),
  // Admin
  create: (data)        => api.post('/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data)    => api.put(`/offers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id)          => api.delete(`/offers/${id}`),
};

export default api;
