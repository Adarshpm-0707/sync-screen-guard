import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, ShoppingBag, ArrowRight, Minus, Plus, 
  ShieldCheck, Truck, Sparkles, Tag, Check, ChevronLeft, Smartphone 
} from 'lucide-react';
import useCart from '../hooks/useCart';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const FREE_SHIPPING_THRESHOLD = 499;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SYNC10') {
      setDiscount(Math.round(cartTotal * 0.1));
      setCouponMsg('Coupon SYNC10 applied: 10% OFF!');
    } else {
      setCouponMsg('Invalid coupon code. Try SYNC10');
    }
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-28 px-4 flex flex-col items-center justify-center bg-[#FAFAFA] text-center">
        <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4 border border-zinc-200">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h2 className="font-display text-2xl font-bold text-zinc-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-zinc-500 text-xs sm:text-sm max-w-sm mb-6">
          Explore our flagship 9H tempered glass and privacy armor screen protectors with 10-second alignment applicators.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
        >
          <span>Explore Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-28 pt-8 sm:pt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              <Link to="/" className="hover:text-zinc-900">Home</Link>
              <span>/</span>
              <span className="text-zinc-900">Shopping Bag</span>
            </nav>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
              Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h1>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 hidden sm:flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Free shipping banner */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-2">
            {amountNeeded === 0 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                You have unlocked FREE Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong className="text-zinc-900">₹{amountNeeded}</strong> more to unlock <strong>FREE Shipping</strong>
              </span>
            )}
            <span className="text-zinc-500 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-zinc-900'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const itemKey = item.cartItemId || `${item.id}-${item.selectedModel || 'iPhone 15 Pro'}`;
              const mainImg = item.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=300';
              
              return (
                <div
                  key={itemKey}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 flex gap-4 sm:gap-5 items-center shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-white border border-zinc-200 p-1.5 overflow-hidden flex items-center justify-center">
                    <img
                      src={mainImg}
                      alt={item.name}
                      className="h-full w-full max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-medium">
                          <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
                          For: <strong className="text-zinc-800">{item.selectedModel || 'iPhone 15 Pro'}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(itemKey)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between flex-wrap gap-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                          className="h-6 w-6 flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="text-right">
                        <span className="text-sm font-black text-zinc-900">
                          ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-zinc-200 p-6 space-y-5 shadow-xs lg:sticky lg:top-24">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Order Summary
            </h2>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. SYNC10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-900 uppercase focus:border-zinc-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[11px] font-semibold ${
                  discount > 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {couponMsg}
                </p>
              )}
            </form>

            {/* Totals breakdown */}
            <div className="space-y-2 text-xs text-zinc-600 border-t border-zinc-100 pt-4">
              <div className="flex justify-between">
                <span>Bag Total</span>
                <span className="font-bold text-zinc-900">₹{cartTotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount (10%)</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="font-bold text-zinc-900">
                  {amountNeeded === 0 ? <span className="text-emerald-600 uppercase text-[10px]">Free</span> : '₹50'}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-100 font-display text-base font-bold text-zinc-900">
                <span>Total Due</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 text-center space-y-1 text-[10px] text-zinc-400">
              <p className="flex items-center justify-center gap-1 text-zinc-600 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Secure Checkout Guarantee
              </p>
              <p>UPI, Cards, NetBanking & Cash On Delivery</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}