import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import useAdminAuth from '../hooks/useAdminAuth';
import AdminButton from '../components/common/AdminButton';

export default function AdminLogin() {
  const { adminUser, login, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 font-sans relative select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-primary-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Login Box */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-lg shadow-primary-500/25">
            <ShieldCheck className="h-6.5 w-6.5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black tracking-wider text-white uppercase">Console Gateway</h1>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-1">Authorized admin personnel only</p>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-xs text-white focus:border-primary-500/80 focus:outline-none transition-colors"
                placeholder="admin@syncarmor.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-xs text-white focus:border-primary-500/80 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AdminButton
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3.5"
          >
            Authenticate Credentials
          </AdminButton>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/admin/signup" 
            className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create an Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
}
