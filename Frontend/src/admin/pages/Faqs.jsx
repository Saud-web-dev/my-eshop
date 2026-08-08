import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqAPI } from '@services/api';
import { faqSchema } from '@utils/validators';
import { formatDate, getErrorMessage } from '@utils/helpers';
import Input, { Textarea } from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const FAQ_CATEGORIES = ['General', 'Shipping', 'Orders', 'Returns', 'Payments', 'Products', 'Account'];

const Faqs = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filter, setFilter]       = useState('All');
  const qc = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => faqAPI.getAll({ includeInactive: 'true' }),
    select: d => d.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(faqSchema),
  });

  const openAdd = () => {
    setEditing(null);
    reset({ question: '', answer: '', category: 'General', sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    reset({
      question: f.question, answer: f.answer, category: f.category,
      sortOrder: f.sortOrder, isActive: f.isActive,
    });
    setModalOpen(true);
  };

  const mutation = useMutation({
    mutationFn: (d) => editing ? faqAPI.update(editing._id, d) : faqAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success(editing ? 'FAQ updated!' : 'FAQ created!');
      setModalOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => faqAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('FAQ deleted.'); setConfirmId(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmId(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: (f) => faqAPI.update(f._id, { isActive: !f.isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('FAQ status updated.'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const categories = ['All', ...FAQ_CATEGORIES];
  const filtered = faqs?.filter(f => filter === 'All' || f.category === filter);

  return (
    <>
      <Helmet><title>FAQs – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">FAQs</h1>
            <p className="text-sm text-text-muted">Manage frequently asked questions shown on the storefront.</p>
          </div>
          <Button onClick={openAdd} icon={<MdAdd size={18} />}>Add FAQ</Button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filter === c ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:bg-surface-overlay'
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Question', 'Category', 'Order', 'Status', 'Updated', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : filtered?.length === 0
                  ? <tr><td colSpan={6} className="py-12 text-center text-text-muted">No FAQs found.</td></tr>
                  : filtered?.map(f => (
                    <tr key={f._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary max-w-md truncate">{f.question}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{f.category || 'General'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{f.sortOrder}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleMutation.mutate(f)} title="Toggle status">
                          <Badge variant={f.isActive ? 'success' : 'default'}>{f.isActive ? 'Active' : 'Inactive'}</Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(f.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(f)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => setConfirmId(f._id)}
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
        title={editing ? 'Edit FAQ' : 'Add FAQ'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={mutation.isPending} onClick={handleSubmit(d => mutation.mutate(d))}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <Input label="Question" required error={errors.question?.message} {...register('question')} />
          <Textarea label="Answer" required rows={4} error={errors.answer?.message} {...register('answer')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" error={errors.category?.message} {...register('category')} list="faq-categories"
              placeholder="e.g. Shipping" />
            <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register('sortOrder')} hint="Lower = higher up" />
          </div>
          <datalist id="faq-categories">
            {FAQ_CATEGORIES.map(c => <option key={c} value={c} />)}
          </datalist>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="accent-accent w-4 h-4" />
            <span className="text-sm text-text-secondary">Active (visible on storefront)</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete FAQ" message="Are you sure you want to delete this FAQ?"
        confirmText="Delete" loading={deleteMutation.isPending} />
    </>
  );
};

export default Faqs;
