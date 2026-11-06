// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { GoogleLogin } from '@react-oauth/google';
// import { useAuth } from '@contexts/AuthContext';
// import { registerSchema } from '@utils/validators';
// import { getErrorMessage } from '@utils/helpers';
// import Input from '@components/ui/Input';
// import Button from '@components/ui/Button';
// import toast from 'react-hot-toast';
// import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

// const Signup = () => {
//   const { register: registerUser, googleAuth } = useAuth();
//   const navigate = useNavigate();
//   const [showPass, setShowPass] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const res = await registerUser({ name: data.name, email: data.email, password: data.password });
//       if (res.success) {
//         toast.success('Account created! Please verify your email.');
//         navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
//       }
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogle = async (credentialResponse) => {
//     try {
//       const res = await googleAuth(credentialResponse.credential);
//       if (res.success) {
//         toast.success('Account created with Google!');
//         navigate('/');
//       }
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-text-primary">Create account</h2>
//         <p className="text-text-muted text-sm mt-1">Join us today</p>
//       </div>

//       {/* Google — only rendered when on signup page, not simultaneously with Login */}
//       <div className="flex justify-center">
//         <GoogleLogin
//           onSuccess={handleGoogle}
//           onError={() => toast.error('Google sign-up failed')}
//           text="signup_with"
//           shape="rectangular"
//           useOneTap={false}
//           cancel_on_tap_outside
//         />
//       </div>

//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full border-t border-border" />
//         </div>
//         <div className="relative flex justify-center">
//           <span className="px-3 bg-surface text-xs text-text-muted">or sign up with email</span>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <Input
//           label="Full Name"
//           placeholder="Your full name"
//           icon={<MdPerson size={16} />}
//           error={errors.name?.message}
//           autoComplete="name"
//           {...register('name')}
//         />
//         <Input
//           label="Email"
//           type="email"
//           placeholder="you@example.com"
//           icon={<MdEmail size={16} />}
//           error={errors.email?.message}
//           autoComplete="email"
//           {...register('email')}
//         />
//         <Input
//           label="Password"
//           type={showPass ? 'text' : 'password'}
//           placeholder="Min. 6 characters"
//           icon={<MdLock size={16} />}
//           iconRight={showPass ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
//           onIconRightClick={() => setShowPass(p => !p)}
//           error={errors.password?.message}
//           autoComplete="new-password"
//           {...register('password')}
//         />
//         <Input
//           label="Confirm Password"
//           type={showConfirm ? 'text' : 'password'}
//           placeholder="Repeat password"
//           icon={<MdLock size={16} />}
//           iconRight={showConfirm ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
//           onIconRightClick={() => setShowConfirm(p => !p)}
//           error={errors.confirmPassword?.message}
//           autoComplete="new-password"
//           {...register('confirmPassword')}
//         />

//         <p className="text-xs text-text-muted">
//           By creating an account you agree to our{' '}
//           <Link to="/terms" className="text-accent hover:underline">Terms</Link> and{' '}
//           <Link to="/privacy-policy" className="text-accent hover:underline">Privacy Policy</Link>.
//         </p>

//         <Button type="submit" fullWidth loading={loading} size="lg">
//           Create Account
//         </Button>
//       </form>

//       <p className="text-center text-sm text-text-muted">
//         Already have an account?{' '}
//         <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
//       </p>
//     </div>
//   );
// };

// export default Signup;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@contexts/AuthContext';
import { registerSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';

const Signup = () => {
  const { register: registerUser, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (res.success) {
        toast.success(res.message || 'Account created! Please verify your email.', { duration: 6000 });
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const res = await googleAuth(credentialResponse.credential);
      if (res.success) {
        toast.success('Account created with Google!');
        navigate('/');
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Create account</h2>
        <p className="text-text-muted text-sm mt-1">Join us today</p>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => toast.error('Google sign-up failed. Please ensure localhost is added as an authorized origin in Google Cloud Console.')}
          text="signup_with"
          shape="rectangular"
          useOneTap={false}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-surface text-xs text-text-muted">
            or sign up with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Your full name"
          icon={<MdPerson size={16} />}
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<MdEmail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Min. 6 characters"
          icon={<MdLock size={16} />}
          iconRight={
            showPass ? (
              <MdVisibilityOff size={16} />
            ) : (
              <MdVisibility size={16} />
            )
          }
          onIconRightClick={() => setShowPass((p) => !p)}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat password"
          icon={<MdLock size={16} />}
          iconRight={
            showConfirm ? (
              <MdVisibilityOff size={16} />
            ) : (
              <MdVisibility size={16} />
            )
          }
          onIconRightClick={() => setShowConfirm((p) => !p)}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <p className="text-xs text-text-muted">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="text-accent hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;