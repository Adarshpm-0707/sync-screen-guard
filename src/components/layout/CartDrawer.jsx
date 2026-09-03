import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, 
  ShieldCheck, Truck, Tag, Check, Sparkles 
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import useCustomerAuth from '../../hooks/useCustomerAuth';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const FREE_SHIPPING_THRESHOLD = 499;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'SYNC10' || code === 'FIRST10') {
      const discount = Math.round(cartTotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess('Coupon SYNC10 applied! 10% discount added.');
    } else if (code === 'FREESHIP') {
      setCouponSuccess('Free Express Shipping applied!');
    } else if (code) {
      setCouponError('Invalid coupon code. Try SYNC10');
    }
  };

  const finalTotal = Math.max(0, cartTotal - appliedDiscount);

  const handleCheckout = () => {
    onClose();
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-zinc-900" />
                <h2 className="font-display text-base font-bold uppercase tracking-wider text-zinc-900">
                  Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Close Bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-100">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                {amountNeeded === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    You unlocked FREE Express Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-zinc-900">₹{amountNeeded}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
                <span className="text-[11px] text-zinc-500">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    progressPercent >= 100 ? 'bg-emerald-500' : 'bg-zinc-900'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-zinc-100">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-zinc-900 mb-1">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mb-6">
                    Looks like you haven't added any electronics, smart gadgets, or accessories yet.
                  </p>
                  <button
                    onClick={() => { onClose(); navigate('/products'); }}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const itemKey = item.cartItemId || `${item.id}-${item.selectedModel || 'Universal'}`;
                  const mainImg = item.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=300';
                  
                  return (
                    <div key={itemKey} className="pt-4 first:pt-0 flex gap-3.5">
                      {/* Product Thumbnail */}
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-white overflow-hidden border border-zinc-200 p-1.5 flex items-center justify-center">
                        <img 
                          src={mainImg} 
                          alt={item.name} 
                          className="h-full w-full max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-tight">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(itemKey)}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer shrink-0"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] font-medium text-zinc-500 mt-1">
                            Model: <span className="text-zinc-800 font-semibold">{item.selectedModel || 'iPhone 15 Pro'}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Quantity selector */}
                          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="h-5 w-5 flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="h-5 w-5 flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-xs font-bold text-zinc-900">
                              ₹{(Number(item.price) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-zinc-100 bg-white p-6 space-y-4">
                {/* Coupon Box */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. SYNC10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-900 placeholder:normal-case placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-500 font-semibold">{couponError}</p>
                )}

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount (10%)</span>
                      <span>-₹{appliedDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-zinc-900">
                      {amountNeeded === 0 ? <span className="text-emerald-600 uppercase text-[10px] font-bold">Free</span> : '₹50'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-100 font-display text-sm font-bold text-zinc-900">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Guarantee strip */}
                <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> 100% Genuine
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3 text-zinc-700" /> Fast Express Delivery
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
