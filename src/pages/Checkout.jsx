import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '../hooks/useCart';
import { supabase } from '../supabaseClient';
import { 
  CreditCard, Truck, CheckCircle, ArrowLeft, 
  ChevronRight, MapPin, User, ShieldCheck, Cpu 
} from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-sky-100">
        <p className="text-sky-600 font-black uppercase tracking-widest">No signals in cart.</p>
      </div>
    );
  }

  const codFee = paymentMethod === 'cod' ? 50 : 0;
  const orderTotal = cartTotal + codFee;

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Valid email address required';
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Valid 10-digit phone number required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Terminal address required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Area code required';
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
    setIsSubmitting(true);
    // Simulating API call for this aesthetic version
    setTimeout(() => {
      setIsSubmitting(false);
      clearCart();
      navigate('/success', { state: { orderId: 'SKY-' + Math.random().toString(36).substr(2, 9).toUpperCase(), amount: orderTotal } });
    }, 2000);
  };

  return (
    <div className="relative w-full min-h-screen bg-sky-100 text-sky-950 font-sans selection:bg-sky-300 overflow-hidden">
      
      {/* ── ATMOSPHERIC SKY BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700 hover:text-sky-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Bay</span>
          </button>
          
          <div className="flex items-center gap-3">
             <Cpu className="w-5 h-5 text-sky-600" />
             <h1 className="text-4xl font-black text-sky-900 tracking-tighter uppercase leading-none">Order <span className="text-cyan-600 italic">Initialization</span></h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          
          {/* Main Form Bay (Left) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Personal Identification */}
            <motion.div 
              className={`rounded-[40px] border transition-all duration-500 overflow-hidden ${currentStep === 1 ? 'bg-sky-200/50 border-sky-400 shadow-2xl shadow-sky-400/20' : 'bg-sky-200/20 border-sky-300/40'}`}
            >
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
              >
                <div className="flex items-center space-x-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm ${currentStep === 1 ? 'bg-sky-900 text-sky-50 shadow-lg' : 'bg-sky-300/40 text-sky-600'}`}>
                    01
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-sky-900 uppercase tracking-widest">Protocol Identification</h3>
                    <p className="text-[10px] text-sky-700/60 font-bold mt-1 uppercase">User profile & contact parameters</p>
                  </div>
                </div>
                {formData.name && currentStep !== 1 && (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                )}
              </button>

              <AnimatePresence>
                {currentStep === 1 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-8 space-y-6 pt-2 border-t border-sky-300/30">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sky-600 uppercase tracking-widest ml-1">Full Name *</label>
                          <input
                            type="text" name="name" value={formData.name} onChange={handleInputChange}
                            className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none transition-all placeholder:text-sky-400"
                            placeholder="Full Name"
                          />
                          {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sky-600 uppercase tracking-widest ml-1">Email Address *</label>
                          <input
                            type="email" name="email" value={formData.email} onChange={handleInputChange}
                            className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none transition-all placeholder:text-sky-400"
                            placeholder="your.email@example.com"
                          />
                          {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sky-600 uppercase tracking-widest ml-1">Phone Number *</label>
                          <input
                            type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                            className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none transition-all placeholder:text-sky-400"
                            placeholder="10-digit phone number"
                          />
                          {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.phone}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleNextStep(1)}
                          className="px-8 py-4 bg-sky-900 text-sky-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-sky-800 transition-all flex items-center gap-3"
                        >
                          Next Matrix <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step 2: Shipping Matrix */}
            <motion.div 
              className={`rounded-[40px] border transition-all duration-500 overflow-hidden ${currentStep === 2 ? 'bg-sky-200/50 border-sky-400 shadow-2xl shadow-sky-400/20' : 'bg-sky-200/20 border-sky-300/40'}`}
            >
              <button
                type="button"
                onClick={() => validateStep1() && setCurrentStep(2)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
              >
                <div className="flex items-center space-x-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm ${currentStep === 2 ? 'bg-sky-900 text-sky-50 shadow-lg' : 'bg-sky-300/40 text-sky-600'}`}>
                    02
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-sky-900 uppercase tracking-widest">Navigation Point</h3>
                    <p className="text-[10px] text-sky-700/60 font-bold mt-1 uppercase">Target shipping coordinates</p>
                  </div>
                </div>
                {formData.address && currentStep !== 2 && (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                )}
              </button>

              <AnimatePresence>
                {currentStep === 2 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-8 space-y-6 pt-2 border-t border-sky-300/30">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-600 uppercase tracking-widest ml-1">Terminal Address *</label>
                        <input
                          type="text" name="address" value={formData.address} onChange={handleInputChange}
                          className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none transition-all placeholder:text-sky-400"
                          placeholder="Flat/House/Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <input
                          type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City"
                          className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none"
                        />
                        <input
                          type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State"
                          className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none"
                        />
                        <input
                          type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code"
                          className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 p-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <button onClick={() => setCurrentStep(1)} className="text-[10px] font-black uppercase text-sky-600">Previous</button>
                        <button
                          onClick={() => handleNextStep(2)}
                          className="px-8 py-4 bg-sky-900 text-sky-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-sky-800 transition-all flex items-center gap-3"
                        >
                          Payment Interface <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step 3: Payment Interface */}
            <motion.div 
              className={`rounded-[40px] border transition-all duration-500 overflow-hidden ${currentStep === 3 ? 'bg-sky-200/50 border-sky-400 shadow-2xl shadow-sky-400/20' : 'bg-sky-200/20 border-sky-300/40'}`}
            >
              <button
                type="button"
                onClick={() => validateStep2() && setCurrentStep(3)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
              >
                <div className="flex items-center space-x-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm ${currentStep === 3 ? 'bg-sky-900 text-sky-50 shadow-lg' : 'bg-sky-300/40 text-sky-600'}`}>
                    03
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-sky-900 uppercase tracking-widest">Transaction Method</h3>
                    <p className="text-[10px] text-sky-700/60 font-bold mt-1 uppercase">Credit transfer selection</p>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {currentStep === 3 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-8 space-y-6 pt-2 border-t border-sky-300/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPaymentMethod('razorpay')}
                          className={`p-6 rounded-[30px] border text-left transition-all flex items-center justify-between ${paymentMethod === 'razorpay' ? 'bg-sky-900 text-sky-50 border-sky-900' : 'bg-sky-300/20 border-sky-300 text-sky-900'}`}
                        >
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Razorpay</p>
                            <p className="text-sm font-bold">UPI / Cards</p>
                          </div>
                          <CreditCard className="w-6 h-6 opacity-40" />
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-6 rounded-[30px] border text-left transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'bg-sky-900 text-sky-50 border-sky-900' : 'bg-sky-300/20 border-sky-300 text-sky-900'}`}
                        >
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">C.O.D.</p>
                            <p className="text-sm font-bold">Hand-to-Hand</p>
                          </div>
                          <Truck className="w-6 h-6 opacity-40" />
                        </button>
                      </div>
                      <p className="text-[10px] text-sky-700/50 font-bold uppercase text-center tracking-[0.2em]">All transactions are secure-encrypted</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Review Panel (Right) */}
          <div className="lg:col-span-4">
            <div className="rounded-[40px] bg-sky-200/50 backdrop-blur-3xl border border-sky-400 p-8 space-y-8 sticky top-32 shadow-2xl shadow-sky-400/20">
              <div className="flex items-center gap-3 border-b border-sky-400/30 pb-6">
                 <ShieldCheck className="w-5 h-5 text-sky-600" />
                 <h2 className="text-xs font-black text-sky-900 uppercase tracking-widest">Vault Review</h2>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-sky-950 uppercase leading-none">{item.name}</p>
                      <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Qty: {item.quantity} · {item.selectedModel}</p>
                    </div>
                    <span className="text-xs font-bold text-sky-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-sky-400/30">
                <div className="flex justify-between text-[10px] font-black text-sky-600 uppercase">
                  <span>Base Unit Total</span>
                  <span>₹{cartTotal}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[10px] font-black text-sky-600 uppercase">
                    <span>Hand-Transfer Fee</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-sky-900 uppercase tracking-widest pt-2 border-t border-sky-400/30">
                  <span>Total Payable</span>
                  <span className="text-lg">₹{orderTotal}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-6 rounded-[28px] bg-sky-900 text-sky-50 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-sky-900/40 hover:bg-sky-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Authorize Order
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}