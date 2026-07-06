// import React, { useState, useEffect } from 'react'
// import { RiAccountCircle2Fill } from "react-icons/ri"
// import { IoMdSend } from "react-icons/io"
// import { FaEye, FaEyeSlash } from "react-icons/fa"
// import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5"
// import { Link, useNavigate } from 'react-router-dom'
// import api from '../services/api.js'

// /* ─── Popup Component ──────────────────────────────────────────── */
// const Popup = ({ type, message, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(onClose, 4000)
//         return () => clearTimeout(timer)
//     }, [onClose])

//     const isError = type === 'error'

//     return (
//         <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
//             isError 
//                 ? 'bg-red-950/90 border border-red-500/30 text-red-300' 
//                 : 'bg-emerald-950/90 border border-emerald-400/30 text-emerald-300'
//         }`}>
//             <span className={`text-2xl flex-shrink-0 ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
//                 {isError ? <IoCloseCircle /> : <IoCheckmarkCircle />}
//             </span>
//             <p className="text-sm font-light tracking-wide m-0 flex-1">{message}</p>
//             <button
//                 onClick={onClose}
//                 className={`bg-transparent border-none text-xl cursor-pointer opacity-60 hover:opacity-100 transition-opacity pl-2 leading-none ${
//                     isError ? 'text-red-400' : 'text-emerald-400'
//                 }`}
//             >
//                 ×
//             </button>
//         </div>
//     )
// }

// /* ─── Signup Component ──────────────────────────────────────────── */
// const Signup = () => {
//     const [showPassword, setShowPassword] = useState(false)
//     const [popup, setPopup] = useState(null)
//     const [loading, setLoading] = useState(false)
//     const navigate = useNavigate()

//     const [state, setState] = useState({ name: '', email: '', password: '' })

//     // ✅ Clear old localStorage data on component mount
//     useEffect(() => {
//         // Clear any old user data from localStorage when signup page loads
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('userRole');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('userName');
//         localStorage.removeItem('userEmail');

//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
        
//         try {
//             const res = await api.post("/admin/signup", state);
            
//             if (res.data.success) {
//                 const userData = res.data.user;
//                 const token = res.data.token;
                
//                 // ✅ Clear any existing data first
//                 localStorage.clear();
                
//                 // ✅ Store ALL user data in localStorage
//                 localStorage.setItem('user', JSON.stringify(userData));
//                 localStorage.setItem('token', token);
//                 localStorage.setItem('isLoggedIn', 'true');
//                 localStorage.setItem('userRole', userData.role || 'admin');
//                 localStorage.setItem('userId', userData._id);
//                 localStorage.setItem('userName', userData.name);
//                 localStorage.setItem('userEmail', userData.email);
                
//                 setPopup({ type: 'success', message: res.data.msg });
//                 setTimeout(() => {
//                     navigate("/dashboard");
//                 }, 1800);
//             }
//         } catch (err) {
//             setPopup({ 
//                 type: 'error', 
//                 message: err.response?.data?.msg || "Signup failed. Please try again." 
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     function handleChange(e) {
//         const name = e.target.name
//         const value = e.target.value
//         setState({ ...state, [name]: value })
//     }

//     return (
//         <>
//             {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

//             <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900">
//                 {/* Animated Background Orbs */}
//                 <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] top-[-200px] right-[-100px] animate-float" />
//                 <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] bottom-[-150px] left-[-100px] animate-float-delayed" />
//                 <div className="absolute w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />

//                 <div className="w-full max-w-[1000px] rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row bg-white/5 backdrop-blur-xl border border-white/10">
                    
//                     {/* LEFT: Form Section */}
//                     <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-white/5">
//                         <div className="w-full max-w-sm">
//                             {/* Header */}
//                             <div className="text-center mb-8">
//                                 <div className="flex justify-center mb-3">
//                                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/20">
//                                         <RiAccountCircle2Fill />
//                                     </div>
//                                 </div>
//                                 <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
//                                     Create Account
//                                 </h1>
//                                 <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mt-3" />
//                                 <p className="text-white/40 text-sm mt-3 font-light tracking-wide">
//                                     Join the admin panel
//                                 </p>
//                             </div>

//                             {/* Form Fields */}
//                             <form onSubmit={handleSubmit} className="space-y-4">
//                                 {/* Name */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-indigo-300/60 uppercase tracking-wider mb-1.5">
//                                         Full Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="John Doe"
//                                         name="name"
//                                         value={state.name}
//                                         required
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white/10 transition-all outline-none"
//                                     />
//                                 </div>

//                                 {/* Email */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-indigo-300/60 uppercase tracking-wider mb-1.5">
//                                         Email Address
//                                     </label>
//                                     <input
//                                         type="email"
//                                         placeholder="you@example.com"
//                                         name="email"
//                                         value={state.email}
//                                         required
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white/10 transition-all outline-none"
//                                     />
//                                 </div>

//                                 {/* Password */}
//                                 <div>
//                                     <label className="block text-xs font-medium text-indigo-300/60 uppercase tracking-wider mb-1.5">
//                                         Password
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type={showPassword ? 'text' : 'password'}
//                                             placeholder="••••••••"
//                                             name="password"
//                                             value={state.password}
//                                             required
//                                             onChange={handleChange}
//                                             className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 focus:bg-white/10 transition-all outline-none"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowPassword(!showPassword)}
//                                             className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
//                                         >
//                                             {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className={`w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 group ${
//                                         loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-purple-600'
//                                     }`}
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             <span>Creating account...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <span>Create Account</span>
//                                             <IoMdSend className="text-lg group-hover:translate-x-1 transition-transform" />
//                                         </>
//                                     )}
//                                 </button>
//                             </form>

//                             {/* Divider */}
//                             <div className="flex items-center gap-4 my-6">
//                                 <div className="flex-1 h-px bg-white/10" />
//                                 <span className="text-xs text-white/30 tracking-wider">OR</span>
//                                 <div className="flex-1 h-px bg-white/10" />
//                             </div>

//                             {/* Login Link */}
//                             <p className="text-center text-white/40 text-sm tracking-wide">
//                                 Already have an account?{' '}
//                                 <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors border-b border-indigo-400/30 hover:border-indigo-300/50 pb-0.5">
//                                     Sign In
//                                 </Link>
//                             </p>
//                         </div>
//                     </div>

//                     {/* RIGHT: Visual Panel */}
//                     <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 relative bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/50 overflow-hidden">
//                         {/* Decorative Elements */}
//                         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
                        
//                         {/* Animated Rings */}
//                         <div className="absolute w-[400px] h-[400px] rounded-full border border-white/5 animate-spin-slow" />
//                         <div className="absolute w-[300px] h-[300px] rounded-full border border-white/10 animate-spin-slow-reverse" />
//                         <div className="absolute w-[200px] h-[200px] rounded-full border border-white/15 animate-spin-slow" />
                        
//                         {/* Content */}
//                         <div className="relative z-10 text-center">
//                             <div className="mb-6">
//                                 <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
//                                     <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                     </svg>
//                                 </div>
//                             </div>
                            
//                             <h2 className="text-2xl font-light text-white tracking-wider mb-2">
//                                 Your Management System
//                             </h2>
//                             <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mb-3" />
//                             <p className="text-white/40 text-sm font-light tracking-wide max-w-xs mx-auto">
//                                 Create your admin account
//                             </p>
                            
//                             <div className="mt-8 flex flex-col gap-2 text-left max-w-xs mx-auto">
//                                 <div className="flex items-center gap-3 text-white/50 text-sm">
//                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
//                                     <span>Secure authentication system</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 text-white/50 text-sm">
//                                     <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
//                                     <span>Manage your team and data</span>
//                                 </div>
//                                 <div className="flex items-center gap-3 text-white/50 text-sm">
//                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
//                                     <span>Real-time analytics dashboard</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Tailwind Custom Animations */}
//             <style>{`
//                 @keyframes float {
//                     0%, 100% { transform: translateY(0px) scale(1); }
//                     50% { transform: translateY(-20px) scale(1.02); }
//                 }
//                 @keyframes float-delayed {
//                     0%, 100% { transform: translateY(0px) scale(1); }
//                     50% { transform: translateY(20px) scale(1.02); }
//                 }
//                 @keyframes pulse-slow {
//                     0%, 100% { opacity: 0.5; }
//                     50% { opacity: 0.8; }
//                 }
//                 @keyframes spin-slow {
//                     from { transform: translate(-50%, -50%) rotate(0deg); }
//                     to { transform: translate(-50%, -50%) rotate(360deg); }
//                 }
//                 @keyframes spin-slow-reverse {
//                     from { transform: translate(-50%, -50%) rotate(0deg); }
//                     to { transform: translate(-50%, -50%) rotate(-360deg); }
//                 }
//                 .animate-float {
//                     animation: float 8s ease-in-out infinite;
//                 }
//                 .animate-float-delayed {
//                     animation: float-delayed 10s ease-in-out infinite;
//                 }
//                 .animate-pulse-slow {
//                     animation: pulse-slow 6s ease-in-out infinite;
//                 }
//                 .animate-spin-slow {
//                     animation: spin-slow 20s linear infinite;
//                     position: absolute;
//                     top: 50%;
//                     left: 50%;
//                     transform-origin: center;
//                 }
//                 .animate-spin-slow-reverse {
//                     animation: spin-slow-reverse 25s linear infinite;
//                     position: absolute;
//                     top: 50%;
//                     left: 50%;
//                     transform-origin: center;
//                 }
//             `}</style>
//         </>
//     )
// }

// export default Signup


import React, { useState, useEffect } from 'react'
import { RiAccountCircle2Fill } from "react-icons/ri"
import { IoMdSend } from "react-icons/io"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5"
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api.js'

/* ─── Popup Component ──────────────────────────────────────────── */
const Popup = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])

    const isError = type === 'error'

    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isError 
                ? 'bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#fc8181]' 
                : 'bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] text-[#4ade80]'
        }`}>
            <span className={`text-2xl flex-shrink-0 ${isError ? 'text-[#fc8181]' : 'text-[#4ade80]'}`}>
                {isError ? <IoCloseCircle /> : <IoCheckmarkCircle />}
            </span>
            <p className="text-sm font-light tracking-wide m-0 flex-1">{message}</p>
            <button
                onClick={onClose}
                className={`bg-transparent border-none text-xl cursor-pointer opacity-60 hover:opacity-100 transition-opacity pl-2 leading-none ${
                    isError ? 'text-[#fc8181]' : 'text-[#4ade80]'
                }`}
            >
                ×
            </button>
        </div>
    )
}

/* ─── Signup Component ──────────────────────────────────────────── */
const Signup = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [popup, setPopup] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [state, setState] = useState({ name: '', email: '', password: '' })

    // ✅ Clear old localStorage data on component mount
    useEffect(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await api.post("/admin/signup", state);
            
            if (res.data.success) {
                const userData = res.data.user;
                const token = res.data.token;
                
                localStorage.clear();
                
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', token);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', userData.role || 'admin');
                localStorage.setItem('userId', userData._id);
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userEmail', userData.email);
                
                setPopup({ type: 'success', message: res.data.msg });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1800);
            }
        } catch (err) {
            setPopup({ 
                type: 'error', 
                message: err.response?.data?.msg || "Signup failed. Please try again." 
            });
        } finally {
            setLoading(false);
        }
    };

    function handleChange(e) {
        const name = e.target.name
        const value = e.target.value
        setState({ ...state, [name]: value })
    }

    return (
        <>
            {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}

            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#06080f] via-[#0c1220] to-[#080b18]">
                {/* Animated Background Orbs - Theme Matching */}
                <div className="absolute w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px] top-[-200px] right-[-100px] animate-float" />
                <div className="absolute w-[400px] h-[400px] bg-[#8b5cf6]/10 rounded-full blur-[120px] bottom-[-150px] left-[-100px] animate-float-delayed" />
                <div className="absolute w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />

                <div className="w-full max-w-[1000px] rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row bg-gradient-to-b from-[rgba(17,24,56,0.6)] to-[rgba(8,11,24,0.6)] backdrop-blur-[20px] border border-[rgba(99,102,241,0.12)]">
                    
                    {/* LEFT: Form Section */}
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-[rgba(255,255,255,0.02)]">
                        <div className="w-full max-w-sm">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-3xl shadow-lg shadow-[rgba(99,102,241,0.3)]">
                                        <RiAccountCircle2Fill />
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-light text-[#e2e8f0] tracking-wide">
                                    Create Account
                                </h1>
                                <div className="w-12 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] mx-auto mt-3" />
                                <p className="text-[#8892b0] text-sm mt-3 font-light tracking-wide">
                                    Join the admin panel
                                </p>
                            </div>

                            {/* Form Fields */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8892b0] uppercase tracking-wider mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        name="name"
                                        value={state.name}
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl text-[#e2e8f0] placeholder-[#8892b0] focus:border-[rgba(99,102,241,0.4)] focus:ring-2 focus:ring-[rgba(99,102,241,0.2)] focus:bg-[rgba(255,255,255,0.05)] transition-all outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8892b0] uppercase tracking-wider mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        name="email"
                                        value={state.email}
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl text-[#e2e8f0] placeholder-[#8892b0] focus:border-[rgba(99,102,241,0.4)] focus:ring-2 focus:ring-[rgba(99,102,241,0.2)] focus:bg-[rgba(255,255,255,0.05)] transition-all outline-none"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-[#8892b0] uppercase tracking-wider mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            name="password"
                                            value={state.password}
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pr-12 bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl text-[#e2e8f0] placeholder-[#8892b0] focus:border-[rgba(99,102,241,0.4)] focus:ring-2 focus:ring-[rgba(99,102,241,0.2)] focus:bg-[rgba(255,255,255,0.05)] transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-[#a8b4d0] transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button - Theme Matching */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 px-6 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl shadow-lg shadow-[rgba(99,102,241,0.3)] hover:shadow-[rgba(99,102,241,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group ${
                                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-[#4f46e5] hover:to-[#7c3aed]'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Creating account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <IoMdSend className="text-lg group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-[rgba(99,102,241,0.15)]" />
                                <span className="text-xs text-[#8892b0] tracking-wider">OR</span>
                                <div className="flex-1 h-px bg-[rgba(99,102,241,0.15)]" />
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-[#8892b0] text-sm tracking-wide">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#6366f1] hover:text-[#8b5cf6] font-medium transition-colors border-b border-[#6366f1]/30 hover:border-[#8b5cf6]/50 pb-0.5">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Visual Panel - Theme Matching */}
                    <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 relative bg-gradient-to-br from-[rgba(99,102,241,0.05)] via-[rgba(139,92,246,0.03)] to-[rgba(8,11,24,0.3)] overflow-hidden border-l border-[rgba(99,102,241,0.08)]">
                        {/* Decorative Elements */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
                        
                        {/* Animated Rings - Theme Colors */}
                        <div className="absolute w-[400px] h-[400px] rounded-full border border-[rgba(99,102,241,0.08)] animate-spin-slow" />
                        <div className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(139,92,246,0.1)] animate-spin-slow-reverse" />
                        <div className="absolute w-[200px] h-[200px] rounded-full border border-[rgba(99,102,241,0.12)] animate-spin-slow" />
                        
                        {/* Content */}
                        <div className="relative z-10 text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[rgba(99,102,241,0.15)] to-[rgba(139,92,246,0.15)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-light text-[#e2e8f0] tracking-wider mb-2">
                                Your Management System
                            </h2>
                            <div className="w-8 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] mx-auto mb-3" />
                            <p className="text-[#8892b0] text-sm font-light tracking-wide max-w-xs mx-auto">
                                Create your admin account
                            </p>
                            
                            <div className="mt-8 flex flex-col gap-2 text-left max-w-xs mx-auto">
                                <div className="flex items-center gap-3 text-[#8892b0] text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/60" />
                                    <span>Secure authentication system</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#8892b0] text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]/60" />
                                    <span>Manage your team and data</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#8892b0] text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/60" />
                                    <span>Real-time analytics dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tailwind Custom Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-20px) scale(1.02); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(20px) scale(1.02); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                @keyframes spin-slow {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes spin-slow-reverse {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(-360deg); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 6s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-origin: center;
                }
                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse 25s linear infinite;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-origin: center;
                }
            `}</style>
        </>
    )
}

export default Signup