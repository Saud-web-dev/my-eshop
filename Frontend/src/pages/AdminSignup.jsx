// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { authAPI } from '@services/api';
// import { getErrorMessage } from '@utils/helpers';
// import Input from '@components/ui/Input';
// import Button from '@components/ui/Button';
// import { PageSpinner } from '@components/ui/Spinner';
// import toast from 'react-hot-toast';
// import { MdPerson, MdEmail, MdLock, MdKey, MdVisibility, MdVisibilityOff, MdAdminPanelSettings } from 'react-icons/md';

// const schema = z.object({
//   name:     z.string().min(2, 'Name must be at least 2 characters'),
//   email:    z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   confirm:  z.string(),
//   setupKey: z.string().min(1, 'Setup key is required'),
// }).refine(d => d.password === d.confirm, {
//   message: 'Passwords do not match',
//   path: ['confirm'],
// });

// const AdminSignup = () => {
//   const navigate  = useNavigate();
//   const [loading, setLoading]         = useState(false);
//   const [checking, setChecking]       = useState(true);
//   const [adminExists, setAdminExists] = useState(false);
//   const [showPass, setShowPass]       = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       setupKey: import.meta.env.VITE_ADMIN_SETUP_KEY || '',
//     },
//   });

//   // Check if admin already exists — if yes, redirect to login
//   useEffect(() => {
//     authAPI.checkAdminExists()
//       .then(({ data }) => {
//         if (data.exists) {
//           setAdminExists(true);
//         }
//       })
//       .catch(() => {})
//       .finally(() => setChecking(false));
//   }, []);

//   if (checking) return <PageSpinner />;

//   if (adminExists) {
//     return (
//       <div className="space-y-4 text-center">
//         <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
//           <MdAdminPanelSettings size={32} className="text-accent" />
//         </div>
//         <h2 className="text-2xl font-bold text-text-primary">Admin Already Exists</h2>
//         <p className="text-text-muted text-sm">
//           An admin account has already been created for this store.
//         </p>
//         <Link to="/login" className="btn-primary inline-block mt-2">
//           Go to Login
//         </Link>
//       </div>
//     );
//   }

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const res = await authAPI.adminRegister({
//         name:     data.name,
//         email:    data.email,
//         password: data.password,
//         setupKey: data.setupKey,
//       });
//       if (res.data.success) {
//         toast.success('Admin account created! Please verify your email.');
//         navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&purpose=email-verification`);
//       }
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="text-center">
//         <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
//           <MdAdminPanelSettings size={32} className="text-accent" />
//         </div>
//         <h2 className="text-2xl font-bold text-text-primary">Create Admin Account</h2>
//         <p className="text-text-muted text-sm mt-1">
//           First-time setup — this can only be done once.
//         </p>
//       </div>

//       {/* Info banner */}
//       <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
//         <p className="font-semibold mb-1">Setup Key Required</p>
//         <p>Enter the <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded">ADMIN_SETUP_KEY</code> from your <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded">Backend/.env</code> file to create the admin account.</p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <Input
//           label="Full Name"
//           placeholder="Your name"
//           icon={<MdPerson size={16} />}
//           error={errors.name?.message}
//           autoComplete="name"
//           {...register('name')}
//         />
//         <Input
//           label="Email Address"
//           type="email"
//           placeholder="admin@example.com"
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
//           error={errors.confirm?.message}
//           autoComplete="new-password"
//           {...register('confirm')}
//         />
//         <Input
//           label="Setup Key"
//           type="password"
//           placeholder="Enter your ADMIN_SETUP_KEY"
//           icon={<MdKey size={16} />}
//           error={errors.setupKey?.message}
//           hint="Find this in Backend/.env → ADMIN_SETUP_KEY"
//           {...register('setupKey')}
//         />

//         <Button type="submit" fullWidth loading={loading} size="lg">
//           Create Admin Account
//         </Button>
//       </form>

//       <p className="text-center text-sm text-text-muted">
//         Already have an account?{' '}
//         <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
//       </p>
//     </div>
//   );
// };

// export default AdminSignup;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@services/api';
import { getErrorMessage } from '@utils/helpers';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { PageSpinner } from '@components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdKey,
  MdVisibility,
  MdVisibilityOff,
  MdAdminPanelSettings,
} from 'react-icons/md';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string(),
    setupKey: z.string().min(1, 'Setup key is required'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

const AdminSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      setupKey: import.meta.env.VITE_ADMIN_SETUP_KEY || '',
    },
  });

  useEffect(() => {
    authAPI
      .checkAdminExists()
      .then(({ data }) => {
        if (data.exists) {
          setAdminExists(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <PageSpinner />;

  if (adminExists) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <MdAdminPanelSettings size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          Admin Already Exists
        </h2>
        <p className="text-text-muted text-sm">
          An admin account has already been created for this store.
        </p>
        <Link to="/login" className="btn-primary inline-block mt-2">
          Go to Login
        </Link>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.adminRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        setupKey: data.setupKey,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Admin account created! Please verify your email.', { duration: 6000 });
        navigate(
          `/verify-otp?email=${encodeURIComponent(data.email)}&purpose=email-verification${res.data.otp ? `&otp=${res.data.otp}` : ''}`
        );
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <MdAdminPanelSettings size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          Create Admin Account
        </h2>
        <p className="text-text-muted text-sm mt-1">
          First-time setup — this can only be done once.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">Setup Key Required</p>
        <p>
          Enter the{' '}
          <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded">
            ADMIN_SETUP_KEY
          </code>{' '}
          from your{' '}
          <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded">
            Backend/.env
          </code>{' '}
          file to create the admin account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Your name"
          icon={<MdPerson size={16} />}
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@example.com"
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
          error={errors.confirm?.message}
          autoComplete="new-password"
          {...register('confirm')}
        />
        <Input
          label="Setup Key"
          type="password"
          placeholder="Enter your ADMIN_SETUP_KEY"
          icon={<MdKey size={16} />}
          error={errors.setupKey?.message}
          hint="Find this in Backend/.env → ADMIN_SETUP_KEY"
          {...register('setupKey')}
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create Admin Account
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

export default AdminSignup;