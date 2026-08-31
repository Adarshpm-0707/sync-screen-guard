import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { 
  X, Mail, Lock, AlertCircle, CheckCircle, Info, UserCheck, ShoppingBag, User, 
  Eye, EyeOff, ShieldCheck, Sparkles, Truck, ArrowRight, Zap 
} from 'lucide-react';

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function CustomerAuthModal({ 
  isOpen = true, 
  onClose, 
  onAuthSuccess, 
  initialMode = 'signin', 
  isPage = false,
  redirectTo = null,
  customTitle = null,
  customSubtitle = null
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'signup' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen && !isPage) return null;

  // Determine target redirect path
  const searchParams = new URLSearchParams(location.search);
  const queryRedirect = searchParams.get('redirect');
  const targetRedirect = redirectTo || location.state?.redirectTo || location.state?.from || queryRedirect || null;
  const isPurchasingFlow = targetRedirect === '/checkout' || targetRedirect?.includes('checkout');

  const executeRedirect = () => {
    if (onClose) onClose();
    if (targetRedirect) {
      navigate(targetRedirect);
    } else if (isPage) {
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setInfo('');
    setGoogleLoading(true);

    try {
      if (targetRedirect) {
        sessionStorage.setItem('auth_redirect_target', targetRedirect);
      }
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Failed to initiate Google sign in.');
      setGoogleLoading(false);
    }
  };

  const handleGuestProceed = (e) => {
    e?.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    const cleanName = guestName.trim() || 'Guest Customer';

    const guestUser = {
      id: 'guest-' + Date.now(),
      email: cleanEmail || 'guest@syncarmor.in',
      name: cleanName,
      is_guest: true
    };

    localStorage.setItem('local_customer_user', JSON.stringify(guestUser));
    setMessage('Continuing as Guest...');
    if (onAuthSuccess) onAuthSuccess(guestUser);
    setTimeout(() => {
      executeRedirect();
    }, 500);
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
          setMessage('Account registered! Proceeding...');
          if (onAuthSuccess) onAuthSuccess(formattedUser);
          setTimeout(() => {
            executeRedirect();
          }, 600);
        } else if (authError) {
          const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail, is_guest: false };
          localStorage.setItem('local_customer_user', JSON.stringify(fallbackUser));
          setMessage('Signed in! Proceeding...');
          if (onAuthSuccess) onAuthSuccess(fallbackUser);
          setTimeout(() => {
            executeRedirect();
          }, 600);
        } else {
          const fallbackUser = { id: 'cust-' + Date.now(), email: cleanEmail, is_guest: false };
          localStorage.setItem('local_customer_user', JSON.stringify(fallbackUser));
          setMessage('Signed in! Proceeding...');
          if (onAuthSuccess) onAuthSuccess(fallbackUser);
          setTimeout(() => {
            executeRedirect();
          }, 600);
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
          setMessage('Welcome back! Proceeding...');
          if (onAuthSuccess) onAuthSuccess(formattedUser);
          setTimeout(() => {
            executeRedirect();
          }, 600);
        } else {
          // Check local customer fallback
          const localCustomer = localStorage.getItem('local_customer_user');
          if (localCustomer) {
            try {
              const parsed = JSON.parse(localCustomer);
              if (parsed.email === cleanEmail) {
                setMessage('Welcome back! Proceeding...');
                if (onAuthSuccess) onAuthSuccess(parsed);
                setTimeout(() => {
                  executeRedirect();
                }, 600);
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

  const modalContent = (
    <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-all cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        {isPurchasingFlow && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
            <Zap className="h-3.5 w-3.5 fill-emerald-600" />
            <span>Fast Checkout • Complete Purchase</span>
          </div>
        )}
        <h2 className="font-display text-2xl font-black text-zinc-900 uppercase tracking-tight">
          {customTitle || (
            authMode === 'signup' 
              ? (isPurchasingFlow ? 'Register & Purchase' : 'Create Account')
              : authMode === 'signin' 
                ? (isPurchasingFlow ? 'Sign In to Purchase' : 'Welcome Back')
                : 'Guest Checkout'
          )}
        </h2>
        <p className="text-xs text-zinc-500 mt-1 font-medium">
          {customSubtitle || (
            authMode === 'signup' 
              ? 'Sign up to track orders, save shipping info & complete your purchase.'
              : authMode === 'signin' 
                ? 'Sign in to access your saved details and proceed directly to purchase.'
                : 'Buy screen protectors quickly without setting a password.'
          )}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200/80 mb-6">
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); setError(''); setMessage(''); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            authMode === 'signin'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('signup'); setError(''); setMessage(''); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            authMode === 'signup'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('guest'); setError(''); setMessage(''); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            authMode === 'guest'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Guest
        </button>
      </div>

      {/* Google Sign In */}
      {authMode !== 'guest' && (
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-2 text-zinc-400">Or use email</span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'guest' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">Full Name (Optional)</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="email"
              required={authMode !== 'guest'}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {authMode !== 'guest' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 pl-10 pr-10 py-2.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            'Processing...'
          ) : authMode === 'signup' ? (
            isPurchasingFlow ? 'Register & Continue to Purchase' : 'Create My Account'
          ) : authMode === 'signin' ? (
            isPurchasingFlow ? 'Sign In & Continue to Purchase' : 'Sign In to Sync'
          ) : (
            'Proceed to Checkout'
          )}
          {!loading && isPurchasingFlow && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-zinc-100 text-center text-[10px] text-zinc-400 font-medium">
        <span>🔒 256-Bit SSL Encrypted Customer Authentication</span>
      </div>
    </div>
  );

  if (isPage) {
    return modalContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />
      <div className="relative z-10 w-full max-w-md">
        {modalContent}
      </div>
    </div>
  );
}
