import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, ShoppingBag, Truck, Package } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen py-24 flex items-center justify-center bg-[#FAFAFA] px-4 font-sans text-zinc-900">
      <div className="max-w-lg w-full text-center space-y-8 bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 shadow-sm"
          >
            <Check className="h-10 w-10 stroke-[3]" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-sm mx-auto">
            Thank you for choosing Sync Screen Guard. Your premium 9H armor glass is packed with an auto-alignment box and prepped for express dispatch.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-5 text-xs space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Order ID:</span>
            <span className="font-mono font-bold text-zinc-900 select-all">{state.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Total Amount:</span>
            <span className="font-bold text-zinc-900">₹{state.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Estimated Delivery:</span>
            <span className="font-bold text-emerald-600">2-4 Business Days (Express)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to={`/tracking?orderId=${state.orderId}`}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 py-3.5 text-xs font-bold text-white uppercase tracking-widest transition-all shadow-sm"
          >
            <Truck className="h-4 w-4" />
            <span>Track Order Status</span>
          </Link>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 py-3.5 text-xs font-bold text-zinc-800 uppercase tracking-widest transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
        
        {/* Guarantee footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-medium pt-2 border-t border-zinc-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>7-Day Free Replacement Guarantee Applies</span>
        </div>

      </div>
    </div>
  );
}
