import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryAPI } from '@services/api';
import { categorySchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input, { Textarea, Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import ImageUpload from '@components/ui/ImageUpload';
import Modal, { ConfirmDialog } from '@components/ui/Modal';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import Badge from '@components/ui/Badge';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Categories = () => {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const qc = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryAPI.getAll({ includeInactive: 'true' }),
    select: d => d.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const openAdd = () => { setEditing(null); reset({ name: '', description: '', isActive: true }); setImageFiles([]); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); reset({ name: cat.name, description: cat.description || '', isActive: cat.isActive }); setImageFiles([]); setModalOpen(true); };

  const mutation = useMutation({
    mutationFn: (fd) => editing ? categoryAPI.update(editing._id, fd) : categoryAPI.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editing ? 'Category updated!' : 'Category created!');
      setModalOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted.'); setConfirmId(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmId(null); },
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
    if (imageFiles.length > 0) fd.append('image', imageFiles[0]);
    mutation.mutate(fd);
  };

  return (
    <>
      <Helmet><title>Categories – Admin</title></Helmet>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <Button onClick={openAdd} icon={<MdAdd size={18} />}>Add Category</Button>
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Category', 'Description', 'Products', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : categories?.length === 0
                  ? <tr><td colSpan={5} className="py-12 text-center text-text-muted">No categories yet.</td></tr>
                  : categories?.map(cat => (
                    <tr key={cat._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cat.image?.url
                            ? <img src={cat.image.url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                            : <div className="w-10 h-10 rounded-lg bg-surface-overlay flex items-center justify-center text-text-muted text-lg">{cat.name[0]}</div>
                          }
                          <span className="font-medium text-text-primary">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs max-w-[200px] truncate">{cat.description || '—'}</td>
                      <td className="px-4 py-3 text-text-secondary">—</td>
                      <td className="px-4 py-3">
                        <Badge variant={cat.isActive ? 'success' : 'default'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => setConfirmId(cat._id)}
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

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={mutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" rows={3} {...register('description')} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('isActive')} defaultChecked className="accent-accent w-4 h-4" />
            <span className="text-sm text-text-secondary">Active</span>
          </label>
          <ImageUpload label="Category Image" value={imageFiles} onChange={f => setImageFiles(f)} maxFiles={1} />
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMutation.mutate(confirmId)}
        title="Delete Category"
        message="This will permanently delete the category. Products in this category must be reassigned first."
        confirmText="Delete" loading={deleteMutation.isPending} />
    </>
  );
};

export default Categories;
