// import { useState, useEffect } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { GoogleLogin } from '@react-oauth/google';
// import { useAuth } from '@contexts/AuthContext';
// import { authAPI } from '@services/api';
// import { loginSchema } from '@utils/validators';
// import { getErrorMessage } from '@utils/helpers';
// import Input from '@components/ui/Input';
// import Button from '@components/ui/Button';
// import toast from 'react-hot-toast';
// import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdAdminPanelSettings } from 'react-icons/md';

// // Shows "Setup Admin" link only when no admin exists yet
// const AdminSetupLink = () => {
//   const [show, setShow] = useState(false);
//   useEffect(() => {
//     authAPI.checkAdminExists()
//       .then(({ data }) => { if (!data.exists) setShow(true); })
//       .catch(() => {});
//   }, []);
//   if (!show) return null;
//   return (
//     <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-center">
//       <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
//         No admin account found. Set up your store first.
//       </p>
//       <Link to="/admin-signup" className="text-xs font-semibold text-accent hover:underline flex items-center justify-center gap-1">
//         <MdAdminPanelSettings size={14} /> Create Admin Account
//       </Link>
//     </div>
//   );
// };

// const Login = () => {
//   const { login, googleAuth } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const redirect = searchParams.get('redirect') || '/';
//   const [showPass, setShowPass] = useState(false);
//   const [loading, setLoading]   = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const res = await login(data);
//       if (res.success) {
//         toast.success(`Welcome back, ${res.user.name}!`);
//         navigate(res.user.role === 'admin' ? '/admin/dashboard' : redirect);
//       }
//     } catch (e) {
//       const msg = getErrorMessage(e);
//       if (e?.response?.data?.requiresVerification) {
//         toast.error('Please verify your email first.');
//         navigate(`/verify-otp?email=${e.response.data.email}`);
//       } else {
//         toast.error(msg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogle = async (credentialResponse) => {
//     setGoogleLoading(true);
//     try {
//       const res = await googleAuth(credentialResponse.credential);
//       if (res.success) {
//         toast.success(res.isNewUser ? 'Account created!' : `Welcome back, ${res.user.name}!`);
//         navigate(res.user.role === 'admin' ? '/admin/dashboard' : redirect);
//       }
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
//         <p className="text-text-muted text-sm mt-1">Sign in to your account</p>
//       </div>

//       {/* Google */}
//       <div className="flex justify-center">
//         <GoogleLogin
//           onSuccess={handleGoogle}
//           onError={() => toast.error('Google sign-in failed')}
//           useOneTap={false}
//           text="signin_with"
//           shape="rectangular"
//           width="100%"
//         />
//       </div>

//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full border-t border-border" />
//         </div>
//         <div className="relative flex justify-center">
//           <span className="px-3 bg-surface text-xs text-text-muted">or continue with email</span>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
//           placeholder="Enter your password"
//           icon={<MdLock size={16} />}
//           iconRight={showPass ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
//           onIconRightClick={() => setShowPass(p => !p)}
//           error={errors.password?.message}
//           autoComplete="current-password"
//           {...register('password')}
//         />

//         <div className="flex items-center justify-between">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input type="checkbox" {...register('rememberMe')} className="accent-accent w-4 h-4" />
//             <span className="text-sm text-text-secondary">Remember me</span>
//           </label>
//           <Link to="/forgot-password" className="text-sm text-accent hover:underline">
//             Forgot password?
//           </Link>
//         </div>

//         <Button type="submit" fullWidth loading={loading} size="lg">
//           Sign In
//         </Button>
//       </form>

//       <p className="text-center text-sm text-text-muted">
//         Don't have an account?{' '}
//         <Link to="/signup" className="text-accent font-medium hover:underline">Create one</Link>
//       </p>

//       {/* Admin setup link — only shown when no admin exists yet */}
//       <AdminSetupLink />
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@contexts/AuthContext';
import { authAPI } from '@services/api';
import { loginSchema } from '@utils/validators';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdAdminPanelSettings,
} from 'react-icons/md';

const AdminSetupLink = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    authAPI
      .checkAdminExists()
      .then(({ data }) => {
        if (!data.exists) setShow(true);
      })
      .catch(() => {});
  }, []);
  if (!show) return null;
  return (
    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-center">
      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
        No admin account found. Set up your store first.
      </p>
      <Link
        to="/admin-signup"
        className="text-xs font-semibold text-accent hover:underline flex items-center justify-center gap-1"
      >
        <MdAdminPanelSettings size={14} /> Create Admin Account
      </Link>
    </div>
  );
};

const Login = () => {
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(res.user.role === 'admin' ? '/admin/dashboard' : redirect);
      }
    } catch (e) {
      const msg = getErrorMessage(e);
      if (e?.response?.data?.requiresVerification) {
        toast.error('Please verify your email first.');
        navigate(`/verify-otp?email=${e.response.data.email}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await googleAuth(credentialResponse.credential);
      if (res.success) {
        toast.success(
          res.isNewUser ? 'Account created!' : `Welcome back, ${res.user.name}!`
        );
        navigate(res.user.role === 'admin' ? '/admin/dashboard' : redirect);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
        <p className="text-text-muted text-sm mt-1">Sign in to your account</p>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => toast.error('Google sign-in failed. Please ensure localhost is added as an authorized origin in Google Cloud Console.')}
          useOneTap={false}
          text="signin_with"
          shape="rectangular"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-surface text-xs text-text-muted">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="Enter your password"
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
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="accent-accent w-4 h-4"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent font-medium hover:underline">
          Create one
        </Link>
      </p>

      <AdminSetupLink />
    </div>
  );
};

export default Login;