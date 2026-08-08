import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@services/api';
import { resetPasswordSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token    = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async ({ password }) => {
    if (!token) { toast.error('Invalid or missing reset token.'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="text-center space-y-4">
      <MdCheckCircle size={56} className="mx-auto text-green-500" />
      <h2 className="text-2xl font-bold text-text-primary">Password reset!</h2>
      <p className="text-text-muted text-sm">Redirecting you to login…</p>
      <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
    </div>
  );

  if (!token) return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-bold text-text-primary">Invalid link</h2>
      <p className="text-text-muted text-sm">This reset link is invalid or has expired.</p>
      <Link to="/forgot-password" className="btn-primary inline-block">Request New Link</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Set new password</h2>
        <p className="text-text-muted text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Min. 6 characters"
          icon={<MdLock size={16} />}
          iconRight={showPass ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
          onIconRightClick={() => setShowPass(p => !p)}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat new password"
          icon={<MdLock size={16} />}
          iconRight={showConfirm ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
          onIconRightClick={() => setShowConfirm(p => !p)}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
