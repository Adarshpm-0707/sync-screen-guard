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
            className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-slate-950 border-l border-violet-900/40 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-violet-900/40">
                <Link to="/" onClick={onClose} className="flex items-center space-x-2 outline-none">
                  <img
                    src={syncLogo}
                    alt="Sync Screenguard Logo"
                    className="h-8 w-auto object-contain max-h-9"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-800/40 bg-violet-950/40 text-violet-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Account / Auth Card */}
              <div className="mt-5 p-3.5 rounded-2xl bg-violet-950/40 border border-violet-800/30">
                {customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shrink-0">
                        {customerInitial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{customerDisplayName}</p>
                        <p className="text-[9px] font-semibold text-emerald-400">● Logged In Customer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 border border-rose-800/30 hover:bg-rose-900/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all shadow-md shadow-violet-900/50 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-xl p-3 text-slate-200 hover:bg-violet-950/50 hover:text-violet-200 transition-all font-semibold text-xs uppercase tracking-wider"
                >
                  <Home className="h-4.5 w-4.5 text-violet-400" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-xl p-3 text-slate-200 hover:bg-violet-950/50 hover:text-violet-200 transition-all font-semibold text-xs uppercase tracking-wider"
                >
                  <ShoppingBag className="h-4.5 w-4.5 text-violet-400" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl p-3 text-slate-200 hover:bg-violet-950/50 hover:text-violet-200 transition-all font-semibold text-xs uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-4.5 w-4.5 text-violet-400" />
                    <span>Shopping Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-600 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/tracking"
                  onClick={onClose}
                  className="flex items-center space-x-3 rounded-xl p-3 text-slate-200 hover:bg-violet-950/50 hover:text-violet-200 transition-all font-semibold text-xs uppercase tracking-wider"
                >
                  <Truck className="h-4.5 w-4.5 text-violet-400" />
                  <span>Track Order</span>
                </Link>
              </nav>
            </div>

            {/* Support Footer Banner */}
            <div className="mt-6 rounded-2xl bg-violet-950/20 p-3.5 border border-violet-800/30 text-center">
              <MessageSquare className="mx-auto h-5 w-5 text-violet-400 mb-1.5" />
              <h4 className="text-xs font-semibold text-white">Need Installation Support?</h4>
              <p className="text-[10px] text-violet-400/80 mt-0.5">We are available 24/7. Chat with our specialists.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
