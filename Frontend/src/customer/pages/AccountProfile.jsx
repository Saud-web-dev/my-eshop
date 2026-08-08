import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { authAPI } from '@services/api';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { getInitials } from '@utils/helpers';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { MdEdit } from 'react-icons/md';

const AccountProfile = () => {
  const { user, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      if (data.phone) fd.append('phone', data.phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await authAPI.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6">
      <h2 className="text-xl font-bold text-text-primary mb-6">Profile Settings</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          {avatarPreview || user?.avatar?.url
            ? <img src={avatarPreview || user.avatar.url} alt={user?.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-border" />
            : <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold">
                {getInitials(user?.name)}
              </div>
          }
          <label className="absolute bottom-0 right-0 p-1.5 bg-accent text-white rounded-full cursor-pointer hover:bg-accent-hover">
            <MdEdit size={14} />
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
            }} />
          </label>
        </div>
        <div>
          <p className="font-semibold text-text-primary">{user?.name}</p>
          <p className="text-sm text-text-muted">{user?.email}</p>
          {user?.isVerified && <span className="text-xs text-green-600 font-medium">✓ Verified</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" required error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Input label="Email" type="email" value={user?.email} readOnly hint="Email cannot be changed" className="opacity-60" />
          <Input label="Phone Number" type="tel" {...register('phone')} />
        </div>
        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>
    </div>
  );
};

export default AccountProfile;
