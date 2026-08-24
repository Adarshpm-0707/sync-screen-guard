import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Truck, ShoppingCart, User, LogOut, MessageSquare } from 'lucide-react';
import useCart from '../../hooks/useCart';
import syncLogo from '../../assets/sync logo.PNG';

export default function MobileMenu({ isOpen, onClose, customer, onOpenAuth, onLogout }) {
  const { cartCount } = useCart();
  const customerEmail = customer?.email || '';
  const customerInitial = customerEmail ? customerEmail.charAt(0).toUpperCase() : '';
  const customerDisplayName = customerEmail.includes('@') ? customerEmail.split('@')[0] : customerEmail;

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
    open: { x: 0, transition: { type: 'tween', duration: 0.3 } },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 0.6 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer Menu Container */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-0 right-0 bottom-0 z-50 w-84 max-w-[88vw] bg-neutral-950/95 backdrop-blur-2xl border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <Link to="/" onClick={onClose} className="flex items-center space-x-2 outline-none">
                  <img
                    src={syncLogo}
                    alt="Sync Screenguard Logo"
                    className="h-8 w-auto object-contain max-h-9"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Account / Auth Card */}
              <div className="mt-6 p-4 rounded-3xl bg-gradient-to-br from-violet-950/50 to-indigo-950/30 border border-violet-500/30 shadow-lg shadow-violet-950/50">
                {customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-black text-sm shadow-md shrink-0 ring-2 ring-violet-400/30">
                        {customerInitial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-white truncate">{customerDisplayName}</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified User
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50 transition-all active:scale-95 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-violet-900/50 active:scale-95 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-2xl p-3.5 text-neutral-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-black text-xs uppercase tracking-widest active:scale-98"
                >
                  <Home className="h-4.5 w-4.5 text-sky-400" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-2xl p-3.5 text-neutral-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-black text-xs uppercase tracking-widest active:scale-98"
                >
                  <ShoppingBag className="h-4.5 w-4.5 text-sky-400" />
                  <span>Products Catalog</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-2xl p-3.5 text-neutral-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-black text-xs uppercase tracking-widest active:scale-98"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-4.5 w-4.5 text-sky-400" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-[10px] font-black text-slate-950 shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/tracking"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-2xl p-3.5 text-neutral-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-black text-xs uppercase tracking-widest active:scale-98"
                >
                  <Truck className="h-4.5 w-4.5 text-sky-400" />
                  <span>Track Order</span>
                </Link>
              </nav>
            </div>

            {/* Support Footer Banner */}
            <div className="mt-6 rounded-3xl bg-white/5 p-4 border border-white/10 text-center space-y-1.5">
              <MessageSquare className="mx-auto h-5 w-5 text-sky-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Installation Support</h4>
              <p className="text-[10px] font-bold text-neutral-400">24/7 Specialist Assistance Available</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
