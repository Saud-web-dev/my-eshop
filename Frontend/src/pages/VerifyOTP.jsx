// import { useState, useRef, useEffect } from 'react';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { useAuth } from '@contexts/AuthContext';
// import { authAPI } from '@services/api';
// import { getErrorMessage } from '@utils/helpers';
// import Button from '@components/ui/Button';
// import toast from 'react-hot-toast';
// import { MdEmail } from 'react-icons/md';

// const VerifyOTP = () => {
//   const [searchParams] = useSearchParams();
//   const email    = searchParams.get('email') || '';
//   const purpose  = searchParams.get('purpose') || 'email-verification';
//   const navigate = useNavigate();
//   const { verifyOTP } = useAuth();

//   const [otp, setOtp]         = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [countdown, setCountdown] = useState(60);
//   const refs = useRef([]);

//   // Countdown for resend
//   useEffect(() => {
//     if (countdown <= 0) return;
//     const t = setTimeout(() => setCountdown(c => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [countdown]);

//   const handleChange = (idx, val) => {
//     const digits = val.replace(/\D/g, '').slice(0, 1);
//     const next = [...otp];
//     next[idx] = digits;
//     setOtp(next);
//     if (digits && idx < 5) refs.current[idx + 1]?.focus();
//   };

//   const handleKeyDown = (idx, e) => {
//     if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
//       refs.current[idx - 1]?.focus();
//     }
//   };

//   const handlePaste = (e) => {
//     const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     const next = [...otp];
//     pasted.split('').forEach((d, i) => { next[i] = d; });
//     setOtp(next);
//     refs.current[Math.min(pasted.length, 5)]?.focus();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const code = otp.join('');
//     if (code.length < 6) { toast.error('Please enter the complete 6-digit OTP.'); return; }

//     setLoading(true);
//     try {
//       const res = await verifyOTP({ email, otp: code, purpose });
//       if (res.success) {
//         toast.success('Email verified successfully!');
//         if (res.isFirstAdmin) {
//           navigate('/admin/setup');
//         } else if (res.user?.role === 'admin') {
//           navigate('/admin/dashboard');
//         } else {
//           navigate('/');
//         }
//       }
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//       setOtp(['', '', '', '', '', '']);
//       refs.current[0]?.focus();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     setResendLoading(true);
//     try {
//       await authAPI.resendOTP({ email, purpose });
//       toast.success('New OTP sent to your email.');
//       setCountdown(60);
//       setOtp(['', '', '', '', '', '']);
//       refs.current[0]?.focus();
//     } catch (e) {
//       toast.error(getErrorMessage(e));
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
//           <MdEmail size={32} className="text-accent" />
//         </div>
//         <h2 className="text-2xl font-bold text-text-primary">Verify your email</h2>
//         <p className="text-text-muted text-sm mt-1">
//           We sent a 6-digit code to <span className="font-medium text-text-primary">{email}</span>
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* OTP boxes */}
//         <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
//           {otp.map((d, i) => (
//             <input
//               key={i}
//               ref={el => refs.current[i] = el}
//               type="text"
//               inputMode="numeric"
//               maxLength={1}
//               value={d}
//               onChange={e => handleChange(i, e.target.value)}
//               onKeyDown={e => handleKeyDown(i, e)}
//               className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface text-text-primary
//                 outline-none transition-all duration-200
//                 ${d ? 'border-accent' : 'border-border'}
//                 focus:border-accent focus:ring-2 focus:ring-accent/30`}
//               aria-label={`OTP digit ${i + 1}`}
//             />
//           ))}
//         </div>

//         <Button type="submit" fullWidth loading={loading} size="lg">
//           Verify Email
//         </Button>
//       </form>

//       <div className="text-center space-y-2">
//         <p className="text-sm text-text-muted">Didn't receive the code?</p>
//         {countdown > 0 ? (
//           <p className="text-sm text-text-muted">Resend in <span className="font-semibold text-accent">{countdown}s</span></p>
//         ) : (
//           <button onClick={handleResend} disabled={resendLoading}
//             className="text-sm text-accent hover:underline font-medium disabled:opacity-50">
//             {resendLoading ? 'Sending…' : 'Resend OTP'}
//           </button>
//         )}
//         <div className="pt-2">
//           <Link to="/login" className="text-sm text-text-muted hover:text-text-primary">← Back to login</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyOTP;

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { authAPI } from '@services/api';
import { getErrorMessage } from '@utils/helpers';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdEmail } from 'react-icons/md';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'email-verification';
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  const urlOtp = searchParams.get('otp') || '';

  useEffect(() => {
    if (urlOtp && urlOtp.length === 6) {
      setOtp(urlOtp.split(''));
      toast.success(`OTP Auto-filled: ${urlOtp}`, { id: 'dev-otp', duration: 8000 });
    }
  }, [urlOtp]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (idx, val) => {
    const digits = val.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[idx] = digits;
    setOtp(next);
    if (digits && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp: code, purpose });
      if (res.success) {
        toast.success('Email verified successfully!');
        if (res.isFirstAdmin) {
          navigate('/admin/setup');
        } else if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { data } = await authAPI.resendOTP({ email, purpose });
      toast.success(data.message || 'New OTP generated.');
      if (data.otp && data.otp.length === 6) {
        setOtp(data.otp.split(''));
      } else {
        setOtp(['', '', '', '', '', '']);
      }
      setCountdown(60);
      refs.current[0]?.focus();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <MdEmail size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          Verify your email
        </h2>
        <p className="text-text-muted text-sm mt-1">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-text-primary">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="flex items-center justify-center gap-3"
          onPaste={handlePaste}
        >
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface text-text-primary
                outline-none transition-all duration-200
                ${d ? 'border-accent' : 'border-border'}
                focus:border-accent focus:ring-2 focus:ring-accent/30`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Verify Email
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-text-muted">Didn't receive the code?</p>
        {countdown > 0 ? (
          <p className="text-sm text-text-muted">
            Resend in{' '}
            <span className="font-semibold text-accent">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-accent hover:underline font-medium disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
        <div className="pt-2">
          <Link
            to="/login"
            className="text-sm text-text-muted hover:text-text-primary"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;