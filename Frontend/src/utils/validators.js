import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

export const productSchema = z.object({
  name:             z.string().min(2, 'Product name is required'),
  price:            z.coerce.number().min(0, 'Price must be a positive number'),
  salePrice:        z.preprocess(value => value === '' ? null : value, z.coerce.number().min(0).nullable().optional()),
  stock:            z.coerce.number().min(0),
  category:         z.string().min(1, 'Category is required'),
  description:      z.string().optional(),
  shortDescription: z.string().optional(),
  sku:              z.string().optional(),
  brand:            z.string().optional(),
  tags:             z.string().optional(),
  isFeatured:       z.boolean().optional(),
  isTrending:       z.boolean().optional(),
  isBestSeller:     z.boolean().optional(),
  isNewArrival:     z.boolean().optional(),
  isFlashSale:      z.boolean().optional(),
  metaTitle:        z.string().optional(),
  metaDescription:  z.string().optional(),
});

export const categorySchema = z.object({
  name:        z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
});

export const couponSchema = z.object({
  code:           z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type:           z.enum(['percentage', 'fixed']),
  value:          z.coerce.number().min(0, 'Value must be positive'),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscount:    z.coerce.number().min(0).optional().nullable(),
  usageLimit:     z.coerce.number().min(1).optional().nullable(),
  expiresAt:      z.string().optional(),
});

export const addressSchema = z.object({
  label:       z.string().optional(),
  fullName:    z.string().min(2, 'Full name is required'),
  phone:       z.string().min(10, 'Valid phone number required'),
  addressLine1:z.string().min(5, 'Address is required'),
  city:        z.string().min(2, 'City is required'),
  state:       z.string().min(2, 'State / Province is required'),
  postalCode:  z.string().min(4, 'Postal code is required'),
  country:     z.string().optional(),
  isDefault:   z.boolean().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
});

export const faqSchema = z.object({
  question:    z.string().min(3, 'Question is required'),
  answer:      z.string().min(3, 'Answer is required'),
  category:    z.string().optional(),
  sortOrder:   z.coerce.number().min(0).optional(),
  isActive:    z.boolean().optional(),
});

export const offerSchema = z.object({
  title:           z.string().min(3, 'Offer title is required'),
  subtitle:        z.string().optional(),
  description:     z.string().optional(),
  discountPercent: z.coerce.number().min(0, 'Discount must be 0–100').max(100).optional().nullable(),
  promoCode:       z.string().optional(),
  link:            z.string().optional(),
  badge:           z.string().optional(),
  startDate:       z.string().optional(),
  endDate:         z.string().optional(),
  sortOrder:       z.coerce.number().min(0).optional(),
  isActive:        z.boolean().optional(),
});

export const contentPageSchema = z.object({
  slug:            z.string().min(1, 'Page slug is required'),
  title:           z.string().min(2, 'Page title is required'),
  content:         z.string().optional(),
  metaTitle:       z.string().optional(),
  metaDescription: z.string().optional(),
  isActive:        z.boolean().optional(),
});
