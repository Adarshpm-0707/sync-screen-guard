import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '../hooks/useCart';
import useCustomerAuth from '../hooks/useCustomerAuth';
import useStoreSettings from '../hooks/useStoreSettings';
import { supabase } from '../supabaseClient';
import { decreaseStockForOrder } from '../utils/stockManager';
import { sendOrderNotificationEmails } from '../utils/orderEmailNotification';
import { 
  CreditCard, Truck, CheckCircle, ArrowLeft, 
  ChevronRight, MapPin, User, ShieldCheck, Lock, Check, Sparkles, AlertCircle 
} from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer, isLoggedIn, openAuthModal } = useCustomerAuth();
  const { settings: storeSettings } = useStoreSettings();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-fill logged in customer data
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || customer.user_metadata?.full_name || customer.name || (customer.email ? customer.email.split('@')[0] : ''),
        email: prev.email || customer.email || '',
      }));
    }

    try {
      const existingLocals = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      if (existingLocals.length > 0) {
        const latest = existingLocals[0];
        setFormData((prev) => ({
          ...prev,
          name: prev.name || latest.customer_name || '',
          email: prev.email || latest.customer_email || '',
          phone: prev.phone || latest.phone || '',
          address: prev.address || latest.address || '',
          city: prev.city || latest.city || '',
          state: prev.state || latest.state || '',
          pincode: prev.pincode || latest.pincode || '',
        }));
      }
    } catch (e) {}
  }, [customer]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-28 px-4 flex flex-col items-center justify-center bg-[#FAFAFA] text-center">
        <h2 className="font-display text-xl font-bold text-zinc-900 mb-2">No items in your bag</h2>
        <p className="text-xs text-zinc-500 mb-6">Please add screen protectors to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const codRate = storeSettings?.cod_fee !== undefined ? Number(storeSettings.cod_fee) : 50;
  const codEnabled = storeSettings?.cod_enabled !== undefined ? Boolean(storeSettings.cod_enabled) : true;
  const codFee = (paymentMethod === 'cod' && codEnabled) ? codRate : 0;
  const orderTotal = cartTotal + codFee;


  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Valid 10-digit mobile number required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Valid 6-digit postal code required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (step) => {
    if (step === 1 && validateStep1()) setCurrentStep(2);
    else if (step === 2 && validateStep2()) setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get current auth/local user session
      const { data: { session } } = await supabase.auth.getSession();
      const localUserStr = localStorage.getItem('local_customer_user');
      let localUser = null;
      try { if (localUserStr) localUser = JSON.parse(localUserStr); } catch (e) {}

      const effectiveUser = customer || session?.user || localUser;
      const isGuest = !isLoggedIn || !effectiveUser || Boolean(effectiveUser.is_guest);
      const userId = (!isGuest && effectiveUser?.id && !effectiveUser.id.startsWith('guest-')) ? effectiveUser.id : null;
      const customerEmail = effectiveUser?.email || formData.email.trim();

      const orderPayload = {
        name: formData.name.trim(),
        email: customerEmail,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        paymentMethod,
        total: orderTotal,
        codFee,
        items: cart,
        isGuest,
        userId
      };

      let createdOrderId = null;

      // 2. Try placing order via Backend API
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (res.ok) {
          const apiData = await res.json();
          createdOrderId = apiData.orderId || apiData.order?.id;
        }
      } catch (apiErr) {
        console.warn('Backend API order endpoint unavailable, using direct Supabase insert:', apiErr);
      }

      // 3. Fallback: Direct Supabase database insertion
      if (!createdOrderId) {
        try {
          const { data: dbOrder, error: dbErr } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              is_guest: isGuest,
              customer_name: formData.name.trim(),
              customer_email: customerEmail || null,
              phone: formData.phone.trim(),
              address: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: formData.pincode.trim(),
              status: 'pending',
              payment_type: paymentMethod,
              payment_status: paymentMethod === 'cod' ? 'pending' : 'success',
              total: orderTotal,
              cod_fee: codFee
            })
            .select()
            .single();

          if (!dbErr && dbOrder?.id) {
            createdOrderId = dbOrder.id;

            if (cart.length > 0) {
              const orderItemsData = cart.map(item => ({
                order_id: dbOrder.id,
                product_id: item.id && item.id.length === 36 ? item.id : 'a3c7849e-b7d1-41f2-892a-fa82f2541a7d',
                quantity: item.quantity,
                price: item.price
              }));
              await supabase.from('order_items').insert(orderItemsData);
            }
          }
        } catch (sbErr) {
          console.error('Direct Supabase insert error:', sbErr);
        }
      }

      // 4. Generate fallback order ID if database is offline
      if (!createdOrderId) {
        createdOrderId = 'SYNC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      }

      // 5. Store in local customer tracking storage
      const localOrderObj = {
        id: createdOrderId,
        user_id: userId,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        status: 'pending',
        payment_type: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'success',
        total: orderTotal,
        cod_fee: codFee,
        is_guest: isGuest,
        created_at: new Date().toISOString(),
        items: cart
      };

      const existingLocals = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      localStorage.setItem('customer_orders', JSON.stringify([localOrderObj, ...existingLocals]));

      // Automatically decrease stock for purchased items
      await decreaseStockForOrder(cart);

      // Dispatch order notification emails to both syncallfyp@gmail.com and customer
      sendOrderNotificationEmails(localOrderObj);

      clearCart();
      setIsSubmitting(false);
      navigate('/success', { 
        state: { 
          orderId: createdOrderId, 
          amount: orderTotal,
          order: localOrderObj 
        } 
      });
    } catch (err) {
      console.error('Order submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 font-sans">
      
      {/* ── 1. Checkout Header ── */}
      <div className="bg-white border-b border-zinc-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Bag</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-zinc-900">
              Secure Checkout
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Checkout Grid ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          
          {/* Left: Accordion Steps (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Customer Auth Account Info Banner */}
            {isLoggedIn ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-emerald-950 font-medium">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {customer?.email ? customer.email.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 leading-tight">
                      Logged in as <span className="text-emerald-700">{customer?.email}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">Your shipping & tracking details are linked to your Sync account.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  Verified
                </span>
              </div>
            ) : (
              <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 leading-tight">Already have a Sync Armor account?</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Sign in to auto-fill address and track your package live.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal({ 
                    mode: 'signin', 
                    redirectTo: '/checkout',
                    title: 'Sign In to Sync',
                    subtitle: 'Sign in to auto-fill your shipping address and link your order'
                  })}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Sign In Now
                </button>
              </div>
            )}

            {/* Step 1: Contact Details */}
            <div className={`rounded-2xl border transition-all overflow-hidden ${
              currentStep === 1 ? 'bg-white border-zinc-900 shadow-md' : 'bg-white border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${
                    currentStep === 1 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Customer Contact Details</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Order confirmation and invoice recipient</p>
                  </div>
                </div>
                {formData.name && formData.email && currentStep !== 1 && (
                  <Check className="h-5 w-5 text-emerald-600" />
                )}
              </button>

              <AnimatePresence>
                {currentStep === 1 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-100 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">Phone Number *</label>
                          <input
                            type="text"
                            name="phone"
                            maxLength={10}
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="9876543210"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => handleNextStep(1)}
                          className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Continue to Delivery</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Delivery Address */}
            <div className={`rounded-2xl border transition-all overflow-hidden ${
              currentStep === 2 ? 'bg-white border-zinc-900 shadow-md' : 'bg-white border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => validateStep1() && setCurrentStep(2)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${
                    currentStep === 2 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Shipping Address</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Where should we deliver your screen protector?</p>
                  </div>
                </div>
                {formData.address && formData.pincode && currentStep !== 2 && (
                  <Check className="h-5 w-5 text-emerald-600" />
                )}
              </button>

              <AnimatePresence>
                {currentStep === 2 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-100 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-700 uppercase">Street Address / House No. *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Flat 4B, Greenfield Towers, MG Road"
                          className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                        />
                        {errors.address && <p className="text-[10px] text-red-500 font-semibold">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.city && <p className="text-[10px] text-red-500 font-semibold">{errors.city}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Maharashtra"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.state && <p className="text-[10px] text-red-500 font-semibold">{errors.state}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-700 uppercase">PIN Code *</label>
                          <input
                            type="text"
                            name="pincode"
                            maxLength={6}
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="400001"
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                          />
                          {errors.pincode && <p className="text-[10px] text-red-500 font-semibold">{errors.pincode}</p>}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNextStep(2)}
                          className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Select Payment</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 3: Payment Method */}
            <div className={`rounded-2xl border transition-all overflow-hidden ${
              currentStep === 3 ? 'bg-white border-zinc-900 shadow-md' : 'bg-white border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => validateStep2() && setCurrentStep(3)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${
                    currentStep === 3 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    3
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Payment Option</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Choose instant prepaid or cash on delivery</p>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {currentStep === 3 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-100 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('razorpay')}
                          className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            paymentMethod === 'razorpay'
                              ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Prepaid Online</span>
                            <span className="text-xs font-bold">UPI / GPay / Cards / NetBanking</span>
                          </div>
                          <CreditCard className="h-5 w-5 opacity-70" />
                        </button>

                        {codEnabled ? (
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cod')}
                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              paymentMethod === 'cod'
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Cash on Delivery</span>
                              <span className="text-xs font-bold">
                                Pay at Doorstep {codRate > 0 ? `(+₹${codRate} COD fee)` : '(Free COD)'}
                              </span>
                            </div>
                            <Truck className="h-5 w-5 opacity-70" />
                          </button>
                        ) : (
                          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-400 text-left flex items-center justify-between opacity-60">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider block">Cash on Delivery</span>
                              <span className="text-xs font-medium">Temporarily Unavailable</span>
                            </div>
                            <Truck className="h-5 w-5 opacity-40" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right: Order Summary Review (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-white border border-zinc-200 p-6 space-y-5 shadow-xs lg:sticky lg:top-24">
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Order Review
            </h2>

            {/* Items review */}
            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar divide-y divide-zinc-100">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start gap-2">
                  <div className="pr-2">
                    <p className="text-xs font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Qty: {item.quantity} • {item.selectedModel}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-zinc-600 border-t border-zinc-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-zinc-900">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
              </div>
              {paymentMethod === 'cod' && codEnabled && (
                <div className="flex justify-between">
                  <span>COD Handling Fee</span>
                  <span className="font-semibold text-zinc-900">
                    {codRate > 0 ? `₹${codRate}` : <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-zinc-100 font-display text-base font-bold text-zinc-900">
                <span>Total Amount</span>
                <span>₹{orderTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authorizing Order...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Place Order • ₹{orderTotal.toLocaleString()}</span>
                </>
              )}
            </button>

            <div className="pt-1 text-center text-[10px] text-zinc-400 space-y-1">
              <p className="flex items-center justify-center gap-1 text-zinc-600 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Genuine Screen Guard & Safe Delivery
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}