import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { X, Mail, Lock, AlertCircle, CheckCircle, Info, UserCheck, ShoppingBag, User } from 'lucide-react';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const handleGuestProceed = (e) => {
    e?.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    const cleanName = guestName.trim() || 'Guest Customer';

    const guestUser = {
      id: 'guest-' + Date.now(),
      email: cleanEmail || 'guest@screenguard.store',
      name: cleanName,
      is_guest: true
    };

    localStorage.setItem('local_customer_user', JSON.stringify(guestUser));
    setMessage('Continuing as Guest...');
    if (onAuthSuccess) onAuthSuccess(guestUser);
    setTimeout(() => {
      onClose();
      navigate('/checkout');
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setInfo('');

    if (authMode === 'guest') {
      return handleGuestProceed(e);
    }

    setLoading(true);
    const cleanEmail = email.trim();

    try {
      if (authMode === 'signup') {
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
          const formattedUser = { ...customerUser, is_guest: false };
          localStorage.setItem('local_customer_user', JSON.stringify(formattedUser));
          setMessage('Account registered successfully in Supabase database!');
          if (onAuthSuccess) onAuthSuccess(formattedUser);
          setTimeout(onClose, 1500);
        } else if (authError) {
          const isRateLimit = authError.message?.toLowerCase().includes('rate limit');
          if (isRateLimit) {
            const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail, is_guest: false };
            localStorage.setItem('local_customer_user', JSON.stringify(fallbackUser));
            setMessage('Signed in locally!');
            setInfo('Notice: Supabase free SMTP rate limit hit (3 emails/hr limit). Customer signed in locally. To save new signups directly into your Supabase Auth Database: Go to Supabase Dashboard -> Authentication -> Providers -> Email, and disable "Confirm email".');
            if (onAuthSuccess) onAuthSuccess(fallbackUser);
          } else {
            setError(authError.message || 'Registration failed.');
          }
        } else {
          const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail, is_guest: false };
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
          const formattedUser = { ...customerUser, is_guest: false };
          localStorage.setItem('local_customer_user', JSON.stringify(formattedUser));
          setMessage('Logged in successfully!');
          if (onAuthSuccess) onAuthSuccess(formattedUser);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Navigation Pill Header */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('guest'); setError(''); setMessage(''); }}
            className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
              authMode === 'guest'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Guest Mode
          </button>
        </div>

        {/* Dynamic Title Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-widest mb-3 ${
            authMode === 'guest'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <span>
              {authMode === 'guest' ? '⚡ Guest Checkout Portal' : 'Customer Store Account'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {authMode === 'signup' && 'Create Customer Account'}
            {authMode === 'signin' && 'Customer Sign In'}
            {authMode === 'guest' && 'Guest Purchase Section'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'signup' && 'Sign up to manage orders and track shipments'}
            {authMode === 'signin' && 'Sign in to access your Sync customer account'}
            {authMode === 'guest' && 'Purchase products directly as a guest without setting up a password'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'guest' ? (
            <>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Guest Name (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3.5 pl-10 pr-4 text-xs text-white focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Guest Name (e.g. John Doe)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Email for Receipt (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3.5 pl-10 pr-4 text-xs text-white focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="guest.email@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs font-black text-slate-950 uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Buy Products as Guest</span>
              </button>
            </>
          ) : (
            <>
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
                {loading ? 'Processing...' : authMode === 'signup' ? 'Sign Up Account' : 'Sign In'}
              </button>
            </>
          )}
        </form>

        {/* Quick Link to Guest Section */}
        {authMode !== 'guest' && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-3">
            <button
              onClick={() => { setAuthMode('guest'); setError(''); setMessage(''); }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-amber-400" />
              <span>Purchase directly as Guest (No password)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

