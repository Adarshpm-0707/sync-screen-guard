import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Truck, ShoppingCart, User, LogOut, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import useCart from '../../hooks/useCart';
import syncLogo from '../../assets/sync logo.PNG';

export default function MobileMenu({ isOpen, onClose, customer, onOpenAuth, onLogout, onOpenCart }) {
  const { cartCount } = useCart();
  const customerEmail = customer?.email || '';
  const customerInitial = customerEmail ? customerEmail.charAt(0).toUpperCase() : '';
  const customerDisplayName = customerEmail.includes('@') ? customerEmail.split('@')[0] : customerEmail;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-zinc-950 text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-zinc-800"
          >
            <div>
              {/* Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
                <Link to="/" onClick={onClose} className="flex items-center space-x-2">
                  <img
                    src={syncLogo}
                    alt="Sync Logo"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Account Box */}
              <div className="mt-5 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                {customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-950 font-bold text-xs shadow-sm">
                        {customerInitial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{customerDisplayName}</p>
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          ● Active Customer
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 transition-colors cursor-pointer"
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
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col space-y-1">
                {[
                  { to: '/', label: 'Home', icon: Home },
                  { to: '/products', label: 'All Products', icon: ShoppingBag },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Promo */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">10-Sec Auto Alignment</p>
              <p className="text-[11px] text-zinc-400">Free applicator tray with every order</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
