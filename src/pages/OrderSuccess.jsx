import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Animated green/purple ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Success Checkmark Circle Animation */}
        <div className="relative flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10 border-2 border-primary-500 text-primary-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Check className="h-10 w-10 stroke-[3]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Success Title */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl">Order Confirmed!</h1>
          <p className="text-xs text-slate-400 leading-relaxed">Thank you for your purchase. Your premium screen guard is being prepped for dispatch.</p>
        </div>

        {/* Order details card */}
        <div className="rounded-2xl border border-dark-border/40 bg-dark-bg/40 p-4.5 text-xs space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Order ID:</span>
            <span className="font-bold text-white tracking-wider select-all">{state.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Total Paid:</span>
            <span className="font-bold text-white">₹{state.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold">Estimated Delivery:</span>
            <span className="font-bold text-emerald-500">2-4 Business Days</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to={`/tracking?orderId=${state.orderId}`}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Track Your Order</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 rounded-xl border border-dark-border/60 bg-dark-card/30 py-3.5 text-xs font-bold text-slate-300 hover:bg-dark-card hover:border-slate-500 transition-all duration-300"
          >
            <ShoppingBag className="h-4 w-4 text-primary-500" />
            <span>Continue Shopping</span>
          </Link>
        </div>
        
        {/* Support helper */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary-500" />
          <span>Sync Armor alignment guard warranty applies.</span>
        </div>

      </div>
    </div>
  );
}
