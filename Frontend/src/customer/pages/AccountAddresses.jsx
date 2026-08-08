import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@services/api';
import { useAuth } from '@contexts/AuthContext';
import { addressSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDeleteOutline, MdHome, MdWork, MdLocationOn, MdCheckCircle } from 'react-icons/md';

const AccountAddresses = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const addresses = user?.addresses || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      fullName: user?.name || '',
      country: 'Pakistan',
      isDefault: addresses.length === 0,
    },
  });

  const saveAddress = async (data) => {
    if (editingId) {
      await authAPI.updateAddress(editingId, data);
      toast.success('Address updated!');
    } else {
      await authAPI.addAddress(data);
      toast.success('Address added!');
    }
    qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    setShowForm(false);
    setEditingId(null);
    reset({ label: 'Home', fullName: user?.name || '', country: 'Pakistan', isDefault: addresses.length === 0 });
  };

  const deleteAddress = async (id) => {
    try {
      await authAPI.deleteAddress(id);
      toast.success('Address deleted.');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const makeDefault = async (id) => {
    try {
      await authAPI.setDefaultAddress(id);
      toast.success('Default address updated.');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setShowForm(true);
    setValue('label', addr.label || 'Home');
    setValue('fullName', addr.fullName || '');
    setValue('phone', addr.phone || '');
    setValue('addressLine1', addr.addressLine1 || '');
    setValue('addressLine2', addr.addressLine2 || '');
    setValue('city', addr.city || '');
    setValue('state', addr.state || '');
    setValue('postalCode', addr.postalCode || '');
    setValue('country', addr.country || 'Pakistan');
    setValue('isDefault', addr.isDefault || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Address Book</h2>
          <p className="text-sm text-text-muted mt-0.5">Save addresses to make checkout faster.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); }} icon={<MdAdd size={16} />}>
          Add Address
        </Button>
      </div>

      {/* Address form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-card p-6">
          <h3 className="font-bold text-text-primary mb-5">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleSubmit(saveAddress)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Label" placeholder="Home / Office / Other" error={errors.label?.message}
                {...register('label')} />
              <Input label="Full Name" required error={errors.fullName?.message}
                {...register('fullName')} />
              <Input label="Phone" required type="tel" error={errors.phone?.message}
                {...register('phone')} />
              <Input label="Address Line 1" required error={errors.addressLine1?.message}
                {...register('addressLine1')} />
              <Input label="Address Line 2 (optional)" {...register('addressLine2')} />
              <Input label="City" required error={errors.city?.message} {...register('city')} />
              <Input label="State / Province" required error={errors.state?.message} {...register('state')} />
              <Input label="Postal Code" required error={errors.postalCode?.message}
                {...register('postalCode')} />
              <Input label="Country" {...register('country')} />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" {...register('isDefault')} className="accent-accent" />
              Set as default address
            </label>
            <div className="flex gap-3">
              <Button type="submit">Save Address</Button>
              <Button type="button" variant="ghost"
                onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Saved addresses */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-surface border border-border rounded-card p-12 text-center">
          <MdLocationOn size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="font-semibold text-text-primary mb-2">No saved addresses</h3>
          <p className="text-text-muted text-sm">Add an address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(a => (
            <div key={a._id} className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 font-semibold text-text-primary text-sm">
                  {a.label === 'Work' ? <MdWork className="text-accent" /> : <MdHome className="text-accent" />}
                  {a.label || 'Address'}
                </span>
                {a.isDefault && <Badge variant="success" dot>Default</Badge>}
              </div>
              <p className="text-sm text-text-secondary font-medium">{a.fullName}</p>
              <p className="text-sm text-text-muted mt-0.5">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
              <p className="text-sm text-text-muted">{a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}</p>
              <p className="text-sm text-text-muted">{a.country}</p>
              <p className="text-sm text-text-muted mt-0.5">{a.phone}</p>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Button size="xs" variant="outline" icon={<MdEdit size={14} />} onClick={() => startEdit(a)}>
                  Edit
                </Button>
                {!a.isDefault && (
                  <Button size="xs" variant="ghost" icon={<MdCheckCircle size={14} />} onClick={() => makeDefault(a._id)}>
                    Set Default
                  </Button>
                )}
                <button onClick={() => deleteAddress(a._id)}
                  className="ml-auto p-2 text-text-muted hover:text-red-500 transition-colors"
                  aria-label="Delete address">
                  <MdDeleteOutline size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;
