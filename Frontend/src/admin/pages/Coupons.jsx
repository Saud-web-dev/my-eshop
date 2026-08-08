import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponAPI } from '@services/api';
import { couponSchema } from '@utils/validators';
import { formatCurrency, formatDate, getErrorMessage } from '@utils/helpers';
import Input, { Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Coupons = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const qc = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponAPI.getAll(),
    select: d => d.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: 'percentage', value: 10 },
  });

  const openAdd = () => {
    setEditing(null);
    reset({ type: 'percentage', value: 10, minOrderAmount: 0, usageLimit: '' });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    reset({
      code: c.code, type: c.type, value: c.value,
      minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '', expiresAt: c.expiresAt ? c.expiresAt.slice(0,10) : '',
    });
    setModalOpen(true);
  };

  const mutation = useMutation({
    mutationFn: (d) => editing ? couponAPI.update(editing._id, d) : couponAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(editing ? 'Coupon updated!' : 'Coupon created!');
      setModalOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon deleted.'); setConfirmId(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmId(null); },
  });

  return (
    <>
      <Helmet><title>Coupons – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Coupons</h1>
          <Button onClick={openAdd} icon={<MdAdd size={18} />}>Create Coupon</Button>
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : coupons?.length === 0
                  ? <tr><td colSpan={8} className="py-12 text-center text-text-muted">No coupons yet.</td></tr>
                  : coupons?.map(c => (
                    <tr key={c._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-accent">{c.code}</td>
                      <td className="px-4 py-3 text-text-secondary capitalize">{c.type}</td>
                      <td className="px-4 py-3 font-semibold">
                        {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{formatCurrency(c.minOrderAmount || 0)}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {c.usedCount} / {c.usageLimit ?? '∞'}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {c.expiresAt ? formatDate(c.expiresAt) : 'No expiry'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={c.isActive ? 'success' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => setConfirmId(c._id)}
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
        title={editing ? 'Edit Coupon' : 'Create Coupon'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(d))}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code" required error={errors.code?.message} {...register('code')} className="uppercase" />
            <Select label="Type" required error={errors.type?.message} {...register('type')}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₨)</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount Value" required type="number" error={errors.value?.message} {...register('value')} />
            <Input label="Max Discount (₨)" type="number" error={errors.maxDiscount?.message} {...register('maxDiscount')} hint="For % coupons" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order Amount (₨)" type="number" {...register('minOrderAmount')} />
            <Input label="Usage Limit" type="number" placeholder="Unlimited" {...register('usageLimit')} />
          </div>
          <Input label="Expiry Date" type="date" {...register('expiresAt')} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="accent-accent w-4 h-4" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete Coupon" message="Are you sure you want to delete this coupon?"
        confirmText="Delete" loading={deleteMutation.isPending} />
    </>
  );
};

export default Coupons;
