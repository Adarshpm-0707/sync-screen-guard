import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react';
import useAdminAuth from '../hooks/useAdminAuth';
import AdminButton from '../components/common/AdminButton';

export default function AdminLogin() {
  const { adminUser, login, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in as admin, redirect directly
    if (adminUser && !authLoading) {
      navigate('/admin');
    }
  }, [adminUser, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password.trim());
    setIsSubmitting(false);

    if (result?.success) {
      navigate('/admin');
    } else {
      setError(result?.error || 'Invalid credentials or access restricted.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 font-sans relative select-none overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-violet-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 hover:border-violet-500/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative z-10 transition-all duration-500">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/50 text-[9px] font-black uppercase tracking-widest text-violet-300 mb-2">
              <KeyRound className="h-3 w-3 text-violet-400" />
              <span>Admin Management Gateway</span>
            </div>
            <h1 className="font-display text-2xl font-black tracking-wide text-white uppercase">Sync Armor Console</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">Authorized Store Administrators Only</p>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-start space-x-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400 mb-6 animate-in fade-in duration-200">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Admin Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all placeholder:text-slate-600"
                placeholder="admin@syncarmor.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Security Key / Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-10 text-xs text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-xs font-black uppercase tracking-widest text-white rounded-2xl transition-all shadow-lg shadow-indigo-950/50 active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating Console...' : 'Authenticate Credentials'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
          <Link 
            to="/admin/signup" 
            className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Register New Admin Account</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
