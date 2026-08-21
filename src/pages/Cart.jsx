import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck, Truck, Sparkles, Lock, ChevronLeft, Smartphone } from 'lucide-react';
import useCart from '../hooks/useCart';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center justify-center">
        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
          <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary-400 backdrop-blur-xl shadow-2xl">
            <ShoppingBag className="h-9 w-9" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-neutral-700 mb-6 text-xs sm:text-sm max-w-xs text-center font-medium">Explore our flagship EZ Fit tempered glass screen protectors.</p>
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary-500/25"
        >
          <span>Explore Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 sm:pt-36 lg:pt-40 pb-32 lg:pb-20 text-left">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 border-b border-neutral-900/10 gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-neutral-800 hover:text-black transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Back</span>
            </button>
            <div>
              <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary-600/15 border border-primary-600/30 text-[10px] font-black uppercase tracking-widest text-primary-900 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Checkout Preview</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-neutral-950 tracking-tight">Shopping Bag</h1>
            </div>
          </div>
          <span className="text-xs font-bold text-neutral-800 self-end sm:self-auto">
            {cart.reduce((acc, i) => acc + i.quantity, 0)} {cart.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'Item' : 'Items'} Selected
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const itemKey = item.cartItemId || `${item.id}-${item.selectedModel || 'iPhone 15 Pro'}`;
              return (
                <div
                  key={itemKey}
                  className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-3.5 sm:p-5 hover:border-primary-600/40 transition-all duration-300 shadow-xl"
                >
                  {/* Mobile Responsive Grid: Image + Details */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    
                    {/* Image */}
                    <div className="shrink-0">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl bg-white/60 border border-black/10 flex items-center justify-center p-1.5 sm:p-2.5">
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="pr-2">
                          <h3 className="text-xs sm:text-base font-black text-neutral-950 leading-snug line-clamp-2">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-600/15 border border-primary-600/30 text-primary-950 text-[10px] font-black uppercase tracking-wider">
                              <Smartphone className="w-3 h-3 text-primary-700" /> For: {item.selectedModel || 'iPhone 15 Pro'}
                            </span>
                            <span className="text-xs font-black text-primary-900">₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(itemKey)}
                          className="p-1 sm:p-1.5 text-neutral-600 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity + Subtotal Row */}
                      <div className="mt-3 sm:mt-4 flex items-center justify-between flex-wrap gap-2 pt-2.5 sm:pt-3 border-t border-black/5">
                        {/* Quantity Controller */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white/70 rounded-xl p-1 border border-black/10">
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 text-neutral-900 text-xs font-bold transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black text-neutral-950 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-neutral-700 block">Subtotal</span>
                          <span className="text-xs sm:text-sm font-black text-neutral-950">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-xl border border-white/30 bg-white/30 text-neutral-900">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold">Free Express Shipping</span>
              </div>
              <div className="flex items-center space-x-2 p-2.5 sm:p-3 rounded-xl border border-white/30 bg-white/30 text-neutral-900">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-700 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold">100% Bubble-Free Fit</span>
              </div>
            </div>
          </div>

          {/* Summary Sidebar (Desktop sticky / Mobile bottom dock) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
              <h2 className="text-xs sm:text-sm font-extrabold text-neutral-950 uppercase tracking-wider pb-2.5 sm:pb-3 border-b border-black/10">
                Order Summary
              </h2>

              <div className="space-y-2.5 sm:space-y-3 text-xs">
                <div className="flex justify-between text-neutral-800 font-semibold">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-950">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-800 font-semibold">
                  <span>Shipping</span>
                  <span className="font-extrabold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-neutral-800 font-semibold">
                  <span>GST Taxes</span>
                  <span className="font-semibold text-neutral-700">Included</span>
                </div>
              </div>

              <div className="border-t border-black/10 pt-3 sm:pt-4 flex justify-between items-baseline">
                <span className="text-xs sm:text-sm font-bold text-neutral-900">Total</span>
                <span className="text-xl sm:text-2xl font-black text-neutral-950">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.99] group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-700 font-semibold pt-1">
                <Lock className="h-3 w-3 text-neutral-700" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}