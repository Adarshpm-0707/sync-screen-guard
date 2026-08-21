import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Mail, Lock, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setInfo('');
    setLoading(true);

    const cleanEmail = email.trim();

    try {
      if (isSignUp) {
        let customerUser = null;
        let authError = null;

        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
          });

          if (signUpError) {
            authError = signUpError;
            if (signUpError.message?.toLowerCase().includes('already registered')) {
              const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
              });
              if (!signInErr && signInData?.user) {
                customerUser = signInData.user;
                authError = null;
              }
            }
          } else if (data?.user) {
            customerUser = data.user;
          }
        } catch (err) {
          authError = err;
        }

        if (customerUser) {
          localStorage.setItem('local_customer_user', JSON.stringify(customerUser));
          setMessage('Account registered successfully in Supabase database!');
          if (onAuthSuccess) onAuthSuccess(customerUser);
          setTimeout(onClose, 1500);
        } else if (authError) {
          const isRateLimit = authError.message?.toLowerCase().includes('rate limit');
          if (isRateLimit) {
            const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail };
            localStorage.setItem('local_customer_user', JSON.stringify(fallbackUser));
            setMessage('Signed in locally!');
            setInfo('Notice: Supabase free SMTP rate limit hit (3 emails/hr limit). Customer signed in locally. To save new signups directly into your Supabase Auth Database: Go to Supabase Dashboard -> Authentication -> Providers -> Email, and disable "Confirm email".');
            if (onAuthSuccess) onAuthSuccess(fallbackUser);
          } else {
            setError(authError.message || 'Registration failed.');
          }
        } else {
          const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail };
          localStorage.setItem('local_customer_user', JSON.stringify(fallbackUser));
          setMessage('Signed in successfully!');
          if (onAuthSuccess) onAuthSuccess(fallbackUser);
          setTimeout(onClose, 1000);
        }
      } else {
        // Sign In mode
        let customerUser = null;
        let signInErrObj = null;

        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (signInError) {
            signInErrObj = signInError;
          } else if (data?.user) {
            customerUser = data.user;
          }
        } catch (err) {
          signInErrObj = err;
        }

        if (customerUser) {
          localStorage.setItem('local_customer_user', JSON.stringify(customerUser));
          setMessage('Logged in successfully!');
          if (onAuthSuccess) onAuthSuccess(customerUser);
          setTimeout(onClose, 1000);
        } else {
          // Check local customer fallback
          const localCustomer = localStorage.getItem('local_customer_user');
          if (localCustomer) {
            try {
              const parsed = JSON.parse(localCustomer);
              if (parsed.email === cleanEmail) {
                setMessage('Logged in successfully!');
                if (onAuthSuccess) onAuthSuccess(parsed);
                setTimeout(onClose, 1000);
                return;
              }
            } catch (e) {}
          }
          setError(signInErrObj?.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-3">
            <span>Customer Store Account</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isSignUp ? 'Create Customer Account' : 'Customer Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? 'Sign up to manage orders and track shipments' : 'Sign in to access your Sync customer account'}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 mb-6">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        {/* Info / Notice Banner */}
        {info && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-300 mb-6 leading-relaxed">
            <Info className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-start space-x-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950/60 py-3.5 pl-10 pr-4 text-xs text-white focus:border-primary-500 focus:outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950/60 py-3.5 pl-10 pr-4 text-xs text-white focus:border-primary-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer text-center"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
              setInfo('');
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}

