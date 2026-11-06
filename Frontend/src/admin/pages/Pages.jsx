import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contentPageAPI } from '@services/api';
import { contentPageSchema } from '@utils/validators';
import { formatDate, getErrorMessage, truncate } from '@utils/helpers';
import Input, { Textarea } from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';

const PAGE_SLUGS = [
  { slug: 'contact',        label: 'Contact Us' },
  { slug: 'faq',            label: 'FAQ Intro' },
  { slug: 'track-order',    label: 'Track Order' },
  { slug: 'shipping',       label: 'Shipping Policy' },
  { slug: 'returns',        label: 'Returns & Refunds' },
  { slug: 'refund-policy',  label: 'Refund Policy' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms',          label: 'Terms of Service' },
];

const PAGE_TEMPLATES = {
  contact: {
    title: 'Contact Us',
    content: '<p>[Add your support email, phone number, business address, and opening hours.]</p>',
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: '<p>[Introduce the topics customers can find in the FAQ section.]</p>',
  },
  'track-order': {
    title: 'Track Your Order',
    content: '<p>[Explain what information customers need to track an order and how to contact support.]</p>',
  },
  shipping: {
    title: 'Shipping Policy',
    content: '<h2>Delivery areas and times</h2><p>[Describe the areas you serve and realistic delivery estimates.]</p><h2>Shipping fees</h2><p>[Explain delivery fees, free-shipping thresholds, and any exceptions.]</p><p><strong>Draft template:</strong> Review and customize this information before publishing.</p>',
  },
  returns: {
    title: 'Returns and Exchanges',
    content: '<h2>Return eligibility</h2><p>[Describe which items may be returned and their condition requirements.]</p><h2>How to request a return</h2><p>[List the steps and contact method customers should use.]</p><p><strong>Draft template:</strong> Review and customize this information before publishing.</p>',
  },
  'refund-policy': {
    title: 'Refund Policy',
    content: '<h2>Refund requests</h2><p>[Explain how customers can request a refund and what information is needed.]</p><h2>Processing</h2><p>[Describe your review process, expected timelines, and refund method.]</p><p><strong>Draft template:</strong> Review and customize this information before publishing.</p>',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: '<h2>Information collected</h2><p>[Describe the customer information your store collects.]</p><h2>How information is used</h2><p>[Explain the purposes and any service providers involved.]</p><h2>Contact</h2><p>[Provide a privacy contact method.]</p><p><strong>Draft template:</strong> Have this policy reviewed for your business and applicable laws before publishing.</p>',
  },
  terms: {
    title: 'Terms of Service',
    content: '<h2>Using this store</h2><p>[Describe the conditions for using your store and placing orders.]</p><h2>Orders and pricing</h2><p>[Explain order acceptance, pricing, and how customers are notified of changes.]</p><h2>Contact</h2><p>[Provide a contact method for questions about these terms.]</p><p><strong>Draft template:</strong> Have these terms reviewed for your business and applicable laws before publishing.</p>',
  },
};

const Pages = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [image, setImage]         = useState(null);
  const qc = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => contentPageAPI.getAll({ includeInactive: 'true' }),
    select: d => d.data.data.filter(page => page.slug !== 'about'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(contentPageSchema),
  });

  const openAdd = () => {
    setEditing(null);
    setImage(null);
    reset({ slug: '', title: '', content: '', metaTitle: '', metaDescription: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setImage(null);
    reset({
      slug: p.slug, title: p.title, content: p.content || '',
      metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '',
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const buildPayload = (d) => {
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    if (image) fd.append('image', image);
    return fd;
  };

  const mutation = useMutation({
    mutationFn: (d) => editing ? contentPageAPI.update(editing._id, d) : contentPageAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success(editing ? 'Page updated!' : 'Page created!');
      setModalOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentPageAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pages'] }); toast.success('Page deleted.'); setConfirmId(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmId(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: (p) => contentPageAPI.update(p._id, { isActive: !p.isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pages'] }); toast.success('Page status updated.'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const usedSlugs = new Set((pages || []).map(p => p.slug));
  const existingSlug = editing?.slug;

  return (
    <>
      <Helmet><title>Pages – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pages</h1>
            <p className="text-sm text-text-muted">Edit policy and information pages. Manage About content and images in Settings → About Page.</p>
          </div>
          <Button onClick={openAdd} icon={<MdAdd size={18} />}>Add Page</Button>
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Slug', 'Title', 'Content', 'Status', 'Updated', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : pages?.length === 0
                  ? <tr><td colSpan={6} className="py-12 text-center text-text-muted">No pages yet. Create one to fill the storefront.</td></tr>
                  : pages?.map(p => (
                    <tr key={p._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-accent">{p.slug}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{p.title}</td>
                      <td className="px-4 py-3 text-text-muted text-xs max-w-xs truncate">{truncate(p.content || '—', 80)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleMutation.mutate(p)} title="Toggle status">
                          <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(p.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View page"
                            className="p-1.5 rounded-lg hover:bg-surface-overlay text-text-muted transition-colors">
                            <MdVisibility size={16} />
                          </a>
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => setConfirmId(p._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Page' : 'Add Page'} size="3xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(buildPayload(d)))}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Slug" required error={errors.slug?.message} {...register('slug')}
                list="page-slugs" placeholder="e.g. shipping" disabled={!!editing}
                hint="About content is managed in Settings → About Page." />
              <datalist id="page-slugs">
                {PAGE_SLUGS.filter(p => !usedSlugs.has(p.slug) || p.slug === existingSlug).map(p => (
                  <option key={p.slug} value={p.slug}>{p.label}</option>
                ))}
              </datalist>
            </div>
            <Input label="Title" required error={errors.title?.message} {...register('title')} />
          </div>
          {!editing && (
            <label className="block text-sm font-medium text-text-secondary">
              Start with a page template
              <select
                defaultValue=""
                onChange={event => {
                  const slug = event.target.value;
                  const template = PAGE_TEMPLATES[slug];
                  if (!template) return;
                  setValue('slug', slug, { shouldValidate: true });
                  setValue('title', template.title, { shouldValidate: true });
                  setValue('content', template.content, { shouldValidate: true });
                }}
                className="input-base mt-1.5"
              >
                <option value="">Choose a template…</option>
                {PAGE_SLUGS.filter(page => PAGE_TEMPLATES[page.slug] && !usedSlugs.has(page.slug)).map(page => (
                  <option key={page.slug} value={page.slug}>{page.label}</option>
                ))}
              </select>
            </label>
          )}
          <Textarea label="Content" rows={8} error={errors.content?.message} {...register('content')}
            className="font-mono text-sm leading-relaxed"
            hint="Starter copy contains bracketed placeholders. Replace them before publishing; legal drafts should be reviewed for your business." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Meta Title (SEO)" error={errors.metaTitle?.message} {...register('metaTitle')} />
            <Input label="Meta Description (SEO)" error={errors.metaDescription?.message} {...register('metaDescription')} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Hero Image (optional)</p>
            <div className="flex items-center gap-4">
              {(editing?.image?.url || image) && (
                <img src={image ? URL.createObjectURL(image) : editing.image.url} alt="hero"
                  className="h-16 w-28 object-cover rounded-lg border border-border" />
              )}
              <label className="btn-outline text-sm cursor-pointer">
                {image || editing?.image?.url ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setImage(e.target.files[0] || null)} />
              </label>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="accent-accent w-4 h-4" />
            <span className="text-sm text-text-secondary">Active (visible on storefront)</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete Page" message="Are you sure you want to delete this page?"
        confirmText="Delete" loading={deleteMutation.isPending} />
    </>
  );
};

export default Pages;
