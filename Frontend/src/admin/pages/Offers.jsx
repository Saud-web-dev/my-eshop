import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offerAPI } from '@services/api';
import { offerSchema } from '@utils/validators';
import { formatDate, getErrorMessage, isActiveNow } from '@utils/helpers';
import Input, { Textarea } from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Offers = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [image, setImage]         = useState(null);
  const qc = useQueryClient();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => offerAPI.getAll({ includeInactive: 'true' }),
    select: d => d.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(offerSchema),
  });

  const openAdd = () => {
    setEditing(null);
    setImage(null);
    reset({
      title: '', subtitle: '', description: '', discountPercent: 0, promoCode: '',
      link: '/shop', badge: '', startDate: '', endDate: '', sortOrder: 0, isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (o) => {
    setEditing(o);
    setImage(null);
    reset({
      title: o.title, subtitle: o.subtitle || '', description: o.description || '',
      discountPercent: o.discountPercent || 0, promoCode: o.promoCode || '',
      link: o.link || '/shop', badge: o.badge || '',
      startDate: o.startDate ? o.startDate.slice(0, 10) : '',
      endDate: o.endDate ? o.endDate.slice(0, 10) : '',
      sortOrder: o.sortOrder, isActive: o.isActive,
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
    mutationFn: (d) => editing ? offerAPI.update(editing._id, d) : offerAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success(editing ? 'Offer updated!' : 'Offer created!');
      setModalOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => offerAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-offers'] }); toast.success('Offer deleted.'); setConfirmId(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmId(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: (o) => offerAPI.update(o._id, { isActive: !o.isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-offers'] }); toast.success('Offer status updated.'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Helmet><title>Offers &amp; Sales – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Offers &amp; Sales</h1>
            <p className="text-sm text-text-muted">Create sale banners and promotions shown to customers.</p>
          </div>
          <Button onClick={openAdd} icon={<MdAdd size={18} />}>Add Offer</Button>
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Offer', 'Discount', 'Promo', 'Schedule', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : offers?.length === 0
                  ? <tr><td colSpan={6} className="py-12 text-center text-text-muted">No offers yet.</td></tr>
                  : offers?.map(o => (
                    <tr key={o._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {o.imageUrl
                            ? <img src={o.imageUrl} alt={o.title} className="w-12 h-10 object-cover rounded-lg border border-border" />
                            : <div className="w-12 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-lg">%</div>}
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary truncate">{o.title}</p>
                            {o.badge && <p className="text-xs text-accent truncate">{o.badge}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-accent">{o.discountPercent ? `${o.discountPercent}%` : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{o.promoCode || '—'}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {o.startDate || o.endDate
                          ? `${o.startDate ? formatDate(o.startDate) : 'Start'} → ${o.endDate ? formatDate(o.endDate) : 'No end'}`
                          : 'Always active'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleMutation.mutate(o)} title="Toggle status">
                          <Badge variant={isActiveNow(o) ? 'success' : 'default'}>
                            {isActiveNow(o) ? 'Live' : 'Off'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(o)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => setConfirmId(o._id)}
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
        title={editing ? 'Edit Offer' : 'Add Offer'} size="2xl"
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
            <Input label="Offer Title" required error={errors.title?.message} {...register('title')} />
            <Input label="Badge (e.g. HOT, NEW)" error={errors.badge?.message} {...register('badge')} />
          </div>
          <Input label="Subtitle" error={errors.subtitle?.message} {...register('subtitle')} />
          <Textarea label="Description" rows={3} error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount (%)" type="number" min="0" max="100" error={errors.discountPercent?.message} {...register('discountPercent')} />
            <Input label="Promo Code" error={errors.promoCode?.message} {...register('promoCode')} placeholder="e.g. RAMADAN30" />
          </div>
          <Input label="Link / CTA" error={errors.link?.message} {...register('link')} placeholder="/shop" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="End Date" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register('sortOrder')} hint="Lower = shown first" />
            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Banner Image (optional)</p>
              <div className="flex items-center gap-4">
                {(editing?.imageUrl || image) && (
                  <img src={image ? URL.createObjectURL(image) : editing.imageUrl} alt="offer"
                    className="h-14 w-24 object-cover rounded-lg border border-border" />
                )}
                <label className="btn-outline text-sm cursor-pointer">
                  {image || editing?.imageUrl ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => setImage(e.target.files[0] || null)} />
                </label>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="accent-accent w-4 h-4" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete Offer" message="Are you sure you want to delete this offer?"
        confirmText="Delete" loading={deleteMutation.isPending} />
    </>
  );
};

export default Offers;
