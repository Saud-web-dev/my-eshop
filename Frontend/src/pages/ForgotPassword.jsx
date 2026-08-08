import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@services/api';
import { forgotPasswordSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdEmail, MdCheckCircle } from 'react-icons/md';

const ForgotPassword = () => {
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSentEmail(email);
      setSent(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="text-center space-y-4">
      <MdCheckCircle size={56} className="mx-auto text-green-500" />
      <h2 className="text-2xl font-bold text-text-primary">Check your email</h2>
      <p className="text-text-muted text-sm">
        If an account exists for <span className="font-medium text-text-primary">{sentEmail}</span>,
        we've sent a password reset link. Check your inbox (and spam folder).
      </p>
      <Link to="/login" className="btn-primary inline-block mt-4">Back to Login</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Forgot password?</h2>
        <p className="text-text-muted text-sm mt-1">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<MdEmail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Remember your password?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
