import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { productAPI, categoryAPI } from '@services/api';
import { productSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input, { Textarea, Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import ImageUpload from '@components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => productAPI.getOne(id),
    select: d => d.data.data,
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-select'],
    queryFn: () => categoryAPI.getAll(),
    select: d => d.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { stock: 0, price: 0 },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        salePrice: product.salePrice || '',
        stock: product.stock,
        category: product.category?._id || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        sku: product.sku || '',
        brand: product.brand || '',
        tags: product.tags?.join(', ') || '',
        isFeatured: product.isFeatured,
        isTrending: product.isTrending,
        isBestSeller: product.isBestSeller,
        isNewArrival: product.isNewArrival,
      });
      setExistingImages(product.images || []);
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (fd) => isEdit ? productAPI.update(id, fd) : productAPI.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    newImages.forEach(f => fd.append('images', f));
    mutation.mutate(fd);
  };

  if (isEdit && productLoading) return (
    <div className="flex justify-center py-20"><div className="skeleton h-8 w-48 rounded" /></div>
  );

  const LABELS = [
    { key: 'isFeatured', label: 'Featured' },
    { key: 'isTrending', label: 'Trending' },
    { key: 'isBestSeller', label: 'Best Seller' },
    { key: 'isNewArrival', label: 'New Arrival' },
    { key: 'isFlashSale', label: 'Flash Sale' },
  ];

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Product' : 'Add Product'} – Admin</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="btn-ghost p-2"><MdArrowBack size={20} /></Link>
          <h1 className="text-2xl font-bold text-text-primary">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main info */}
            <div className="xl:col-span-2 space-y-5">
              <div className="bg-surface border border-border rounded-card p-6 space-y-4">
                <h3 className="font-semibold text-text-primary">Basic Information</h3>
                <Input label="Product Name" required error={errors.name?.message} {...register('name')} />
                <Textarea label="Short Description" rows={2} {...register('shortDescription')} />
                <Textarea label="Full Description" rows={5} {...register('description')} />
              </div>

              <div className="bg-surface border border-border rounded-card p-6 space-y-4">
                <h3 className="font-semibold text-text-primary">Pricing & Inventory</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Input label="Regular Price (₨)" required type="number" step="0.01"
                    error={errors.price?.message} {...register('price')} />
                  <Input label="Sale Price (₨)" type="number" step="0.01"
                    error={errors.salePrice?.message} {...register('salePrice')} hint="Leave empty if no sale" />
                  <Input label="Stock Quantity" required type="number"
                    error={errors.stock?.message} {...register('stock')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" {...register('sku')} />
                  <Input label="Brand" {...register('brand')} />
                </div>
                <Input label="Tags (comma separated)" {...register('tags')} hint="e.g. oud, woody, luxury" />
              </div>

              <div className="bg-surface border border-border rounded-card p-6 space-y-4">
                <h3 className="font-semibold text-text-primary">Product Images</h3>
                {isEdit && existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-text-muted mb-2">Existing Images</p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, i) => (
                        <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={async () => {
                              await productAPI.deleteImage(id, img.publicId);
                              setExistingImages(ex => ex.filter((_, j) => j !== i));
                            }}
                            className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <ImageUpload
                  multiple
                  label={isEdit ? 'Add More Images' : 'Upload Images'}
                  value={newImages}
                  onChange={setNewImages}
                  maxFiles={10}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-surface border border-border rounded-card p-6 space-y-4">
                <h3 className="font-semibold text-text-primary">Category</h3>
                <Select label="Category" required error={errors.category?.message} {...register('category')}>
                  <option value="">Select category…</option>
                  {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </div>

              <div className="bg-surface border border-border rounded-card p-6">
                <h3 className="font-semibold text-text-primary mb-4">Labels</h3>
                <div className="space-y-3">
                  {LABELS.map(l => (
                    <label key={l.key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register(l.key)} className="accent-accent w-4 h-4" />
                      <span className="text-sm text-text-secondary">{l.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-card p-6 space-y-4">
                <h3 className="font-semibold text-text-primary">SEO</h3>
                <Input label="Meta Title" {...register('metaTitle')} />
                <Textarea label="Meta Description" rows={3} {...register('metaDescription')} />
              </div>

              <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
              <Link to="/admin/products" className="btn-ghost w-full text-center block border border-border">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductForm;
