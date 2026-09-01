import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Printer, 
  RotateCw, 
  Copy, 
  CheckCheck,
  Download
} from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state;

  const [printKey, setPrintKey] = useState(0);
  const [isPrinting, setIsPrinting] = useState(true);
  const [printProgress, setPrintProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Retrieve existing order from state or localStorage, or generate realistic preview order
  const orderData = useMemo(() => {
    let orderInfo = state?.order || null;
    let orderId = state?.orderId || null;

    if (!orderInfo) {
      try {
        const stored = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        if (orderId) {
          orderInfo = stored.find(o => o.id === orderId) || stored[0] || null;
        } else if (stored.length > 0) {
          orderInfo = stored[0];
          orderId = orderInfo.id;
        }
      } catch {
        orderInfo = null;
      }
    }

    if (!orderId) {
      orderId = 'SYNC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-IN';
    }

    const orderDate = orderInfo?.created_at ? new Date(orderInfo.created_at) : new Date();
    const items = orderInfo?.items && orderInfo.items.length > 0 
      ? orderInfo.items 
      : [
          {
            name: 'Sync 9H Privacy Armor Screen Guard',
            model: 'iPhone 16 Pro Max',
            finish: 'Matte Privacy 9H',
            quantity: 1,
            price: state?.amount || 499
          },
          {
            name: 'Sync Auto-Alignment Fast Install Tray',
            model: 'Precision Alignment Frame',
            finish: 'Zero-Dust Reusable',
            quantity: 1,
            price: 0
          }
        ];

    const amount = state?.amount || orderInfo?.total || items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0) || 499;

    return {
      orderId: orderId,
      amount: amount,
      customer_name: orderInfo?.customer_name || 'Verified Customer',
      customer_email: orderInfo?.customer_email || 'customer@syncguard.in',
      phone: orderInfo?.phone || '+91 98465 45949',
      address: orderInfo?.address || 'Flat 402, Skyline Residency, Express Highway',
      city: orderInfo?.city || 'Bengaluru',
      state: orderInfo?.state || 'Karnataka',
      pincode: orderInfo?.pincode || '560001',
      payment_type: orderInfo?.payment_type || (state?.paymentId ? 'razorpay' : 'online'),
      payment_status: orderInfo?.payment_status || 'success',
      razorpay_payment_id: state?.paymentId || orderInfo?.razorpay_payment_id || null,
      cod_fee: orderInfo?.cod_fee || 0,
      date: orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      items: items
    };
  }, [state]);

  // Stepped realistic thermal printing effect
  useEffect(() => {
    setIsPrinting(true);
    setPrintProgress(0);
    setShowConfetti(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsPrinting(false);
        setShowConfetti(true);
      }
      setPrintProgress(progress);
    }, 70);

    return () => clearInterval(interval);
  }, [printKey]);

  const handleCopyOrderId = () => {
    if (!orderData?.orderId) return;
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReplay = () => {
    setPrintKey(prev => prev + 1);
  };

  const subtotal = orderData.items.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <div className="min-h-screen py-8 sm:py-16 flex flex-col items-center justify-center bg-[#0F1015] px-3 sm:px-4 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2430_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Confetti / Sparkle Burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-40">
            {[...Array(26)].map((_, i) => {
              const angle = (i / 26) * 360;
              const distance = 130 + (i % 4) * 45;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;
              const colors = ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#38BDF8', '#FFFFFF'];
              const color = colors[i % colors.length];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    scale: [0, 1.2, 0.6], 
                    x, 
                    y: y + 45,
                    rotate: i * 40 
                  }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-2 h-2 rounded-sm shadow-md"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center">
        
        {/* Top Header Live Status */}
        <motion.div 
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-5 sm:mb-7 space-y-1.5 sm:space-y-2 px-2"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-inner">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Order Confirmed & Payment Verified</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Official Receipt Generating
          </h1>
          <p className="text-[11px] sm:text-sm text-zinc-400 font-medium max-w-sm sm:max-w-md mx-auto">
            Your live thermal invoice & warranty authentication is printing below.
          </p>
        </motion.div>

        {/* ── THE HARDWARE POS PRINTER CASING ── */}
        <div className="w-full relative flex flex-col items-center">
          
          {/* Printer Chassis Head */}
          <motion.div 
            animate={isPrinting ? { y: [0, -1, 1, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.18 }}
            className="w-full bg-gradient-to-b from-[#1E1F27] via-[#16171E] to-[#111217] border-2 border-zinc-700/80 rounded-2xl p-2.5 sm:p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-30 flex items-center justify-between gap-2"
          >
            {/* Status & Printer Head Indicator */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-300 shadow-inner shrink-0">
                <Printer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isPrinting ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-1 sm:gap-1.5 truncate">
                  <span>SYNC POS-80</span>
                  <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300">203 DPI</span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${isPrinting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span className="tracking-wide truncate">
                    {isPrinting ? `PRINTING (${printProgress}%)` : 'PRINT COMPLETE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons in Printer Header */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleReplay}
                title="Replay Receipt Printing Animation"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1 border border-zinc-700 active:scale-95"
              >
                <RotateCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isPrinting ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Reprint</span>
              </button>
              <button
                onClick={handlePrint}
                title="Save Receipt as PDF or Print"
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">Save</span>
              </button>
            </div>

            {/* Dispenser Throat Ejection Lip / Slit */}
            <div className="absolute -bottom-2 left-3 right-3 h-3 bg-[#08080B] rounded-full border border-zinc-800 shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] -z-10" />
          </motion.div>

          {/* ── THE PRINTED THERMAL PAPER CONTAINER ── */}
          <div className="w-full px-1 sm:px-3 relative -mt-1 z-20 overflow-hidden pt-1 pb-3">
            
            <motion.div
              key={printKey}
              initial={{ y: '-85%', opacity: 0.8 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                duration: 2.2,
                ease: [0.12, 0.8, 0.32, 1]
              }}
              id="printable-receipt"
              className="bg-[#FFFDF7] text-zinc-950 border border-zinc-300 rounded-b-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] relative font-mono text-xs select-text overflow-hidden print:border-none print:shadow-none w-full"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.015) 20px)'
              }}
            >
              {/* Top Serrated Jagged Edge (SVG Teeth) */}
              <div className="w-full h-2.5 sm:h-3 bg-zinc-900 overflow-hidden leading-none flex">
                <svg viewBox="0 0 400 12" preserveAspectRatio="none" className="w-full h-2.5 sm:h-3 fill-[#FFFDF7]">
                  <path d="M0,12 L10,0 L20,12 L30,0 L40,12 L50,0 L60,12 L70,0 L80,12 L90,0 L100,12 L110,0 L120,12 L130,0 L140,12 L150,0 L160,12 L170,0 L180,12 L190,0 L200,12 L210,0 L220,12 L230,0 L240,12 L250,0 L260,12 L270,0 L280,12 L290,0 L300,12 L310,0 L320,12 L330,0 L340,12 L350,0 L360,12 L370,0 L380,12 L390,0 L400,12 Z" />
                </svg>
              </div>

              {/* Live Laser Thermal Scan Line */}
              {isPrinting && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2.2, ease: 'linear' }}
                  className="absolute left-0 right-0 h-8 sm:h-10 bg-gradient-to-b from-transparent via-emerald-400/25 to-emerald-500/50 border-b-2 border-emerald-500 pointer-events-none z-30 shadow-[0_4px_12px_rgba(16,185,129,0.5)]"
                />
              )}

              {/* Paper Content Body */}
              <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-zinc-900">
                
                {/* 1. Official Store Header */}
                <div className="text-center space-y-1 border-b-2 border-dashed border-zinc-300 pb-3 sm:pb-4">
                  <div className="font-display font-black text-lg sm:text-2xl tracking-tight text-black uppercase">
                    SYNC SCREEN GUARD
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-700 uppercase tracking-widest font-bold">
                    Official Tax Invoice & Warranty Slip
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">
                    GSTIN: 32AABCS1429K1Z5 • REG NO: SYN-2026-9941
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500">
                    www.syncscreenguard.com • support@syncguard.in
                  </div>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded bg-zinc-900 text-white text-[8px] sm:text-[9px] font-bold tracking-widest uppercase">
                    ★ ORIGINAL 9H ARMOR GLASS ★
                  </div>
                </div>

                {/* 2. Order Metadata & Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-[11px] border-b-2 border-dashed border-zinc-300 pb-3">
                  <div className="flex sm:block justify-between items-center">
                    <span className="text-zinc-500 block text-[8px] sm:text-[9px] uppercase tracking-wider font-bold">ORDER ID</span>
                    <div className="flex items-center gap-1 font-extrabold text-black">
                      <span className="select-all">#{orderData.orderId}</span>
                      <button 
                        onClick={handleCopyOrderId}
                        title="Copy Order ID"
                        className="text-zinc-500 hover:text-black p-0.5"
                      >
                        {copied ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:block justify-between items-center sm:text-right">
                    <span className="text-zinc-500 block text-[8px] sm:text-[9px] uppercase tracking-wider font-bold">DATE & TIME</span>
                    <span className="font-semibold text-zinc-900">{orderData.date} • {orderData.time}</span>
                  </div>

                  <div className="flex sm:block justify-between items-center">
                    <span className="text-zinc-500 block text-[8px] sm:text-[9px] uppercase tracking-wider font-bold">CUSTOMER</span>
                    <div className="sm:block text-right sm:text-left">
                      <span className="font-bold text-zinc-900 block truncate max-w-[140px] sm:max-w-none">{orderData.customer_name}</span>
                      {orderData.phone && <span className="text-zinc-600 text-[9px] sm:text-[10px] font-mono">{orderData.phone}</span>}
                    </div>
                  </div>

                  <div className="flex sm:block justify-between items-center sm:text-right">
                    <span className="text-zinc-500 block text-[8px] sm:text-[9px] uppercase tracking-wider font-bold">PAYMENT STATUS</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                      orderData.payment_type === 'cod' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {orderData.payment_type === 'cod' 
                        ? 'COD (PAY ON DELIVERY)' 
                        : orderData.razorpay_payment_id 
                          ? `PAID (RAZORPAY: ${orderData.razorpay_payment_id.slice(-8)})` 
                          : 'PAID (ONLINE)'}
                    </span>
                  </div>

                  {orderData.address && (
                    <div className="col-span-1 sm:col-span-2 mt-1 text-[9px] sm:text-[10px] text-zinc-800 bg-zinc-100/90 p-2 rounded border border-zinc-200 break-words">
                      <span className="text-zinc-500 block text-[7px] sm:text-[8px] uppercase tracking-wider font-bold">DISPATCH ADDRESS:</span>
                      <span className="font-medium">{orderData.address}, {orderData.city}, {orderData.state} - {orderData.pincode}</span>
                    </div>
                  )}
                </div>

                {/* 3. Itemized Purchasing Details Table */}
                <div className="space-y-2 border-b-2 border-dashed border-zinc-300 pb-3 sm:pb-4">
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-wider pb-1 border-b border-zinc-200">
                    <span className="flex-1 pr-2">ITEM / MODEL</span>
                    <span className="w-12 text-center shrink-0">QTY</span>
                    <span className="w-16 sm:w-20 text-right shrink-0">TOTAL</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {orderData.items.map((item, index) => {
                      const itemTotal = (item.price || 0) * (item.quantity || 1);
                      return (
                        <div key={index} className="flex justify-between items-start text-[10px] sm:text-[11px] leading-tight">
                          <div className="flex-1 pr-2 min-w-0">
                            <div className="font-extrabold text-black break-words">{item.name}</div>
                            {(item.model || item.finish || item.glass_finish) && (
                              <div className="text-[9px] sm:text-[10px] text-zinc-600 font-sans mt-0.5 break-words">
                                {item.model || ''} {item.finish || item.glass_finish ? `• ${item.finish || item.glass_finish}` : ''}
                              </div>
                            )}
                          </div>
                          <div className="w-12 text-center text-zinc-800 font-bold shrink-0">
                            {item.quantity || 1}x
                          </div>
                          <div className="w-16 sm:w-20 text-right font-black text-black shrink-0">
                            {itemTotal === 0 ? 'FREE' : `₹${itemTotal.toLocaleString()}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Financial Calculations Breakdown */}
                <div className="space-y-1.5 text-[10px] sm:text-[11px] border-b-2 border-dashed border-zinc-300 pb-3">
                  <div className="flex justify-between text-zinc-700">
                    <span>Item Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Express Air Dispatch & Safe Box</span>
                    <span className="text-emerald-800 font-black">FREE (₹0)</span>
                  </div>
                  {orderData.cod_fee > 0 && (
                    <div className="flex justify-between text-zinc-700">
                      <span>COD Handling Charge</span>
                      <span className="font-semibold">₹{orderData.cod_fee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600 text-[9px] sm:text-[10px]">
                    <span>GST (18% Included)</span>
                    <span>₹{Math.round((orderData.amount * 0.18) / 1.18).toLocaleString()}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center text-sm sm:text-base font-black text-black pt-2 border-t-2 border-zinc-900 mt-1">
                    <span className="uppercase tracking-tight">AMOUNT PAYABLE:</span>
                    <span className="text-base sm:text-lg font-display text-emerald-900">₹{orderData.amount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* 5. Warranty & Guarantee Shield Badge */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 text-emerald-950">
                  <div className="p-1 sm:p-1.5 rounded-full bg-emerald-600 text-white shrink-0 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] leading-tight">
                    <div className="font-extrabold uppercase tracking-wider">100% GENUINE PRODUCT GUARANTEE</div>
                    <div className="text-emerald-800 text-[8px] sm:text-[9px] font-sans">
                      100% Fit & Premium Protection Assured.
                    </div>
                  </div>
                </div>

                {/* 6. Vector Barcode & QR Code Section */}
                <div className="pt-1 sm:pt-2 text-center space-y-1.5 sm:space-y-2">
                  <div className="flex justify-center px-2">
                    {/* Simulated High Density Vector Barcode */}
                    <div className="flex items-center h-8 sm:h-10 w-full max-w-[240px] sm:max-w-[280px] justify-between bg-white px-2 py-1 rounded border border-zinc-300 overflow-hidden">
                      {[
                        3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1
                      ].map((w, i) => (
                        <div
                          key={i}
                          className="h-full bg-black shrink-0"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-widest text-zinc-700 font-mono font-bold truncate">
                    *{orderData.orderId}*
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-widest">
                    THANK YOU FOR CHOOSING SYNC SCREEN GUARD
                  </div>
                </div>

              </div>

              {/* Bottom Serrated Jagged Edge (SVG Teeth) */}
              <div className="w-full h-2.5 sm:h-3 bg-zinc-900 overflow-hidden leading-none flex">
                <svg viewBox="0 0 400 12" preserveAspectRatio="none" className="w-full h-2.5 sm:h-3 fill-[#FFFDF7]">
                  <path d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 L370,12 L380,0 L390,12 L400,0 Z" />
                </svg>
              </div>

            </motion.div>
          </div>
        </div>

        {/* ── ACTION BUTTONS & TRACKING NAVIGATION ── */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full mt-4 sm:mt-6 space-y-2.5 sm:space-y-3 px-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Link
              to={`/tracking?orderId=${orderData.orderId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 sm:py-3.5 px-4 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Truck className="h-4 w-4 stroke-[2.5]" />
              <span>Track Dispatch</span>
            </Link>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 py-3 sm:py-3.5 px-4 text-xs font-bold text-zinc-200 uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span>Print Invoice</span>
            </button>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#16171E] hover:bg-zinc-800 py-3 sm:py-3.5 px-4 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>

          {/* Tracking SMS/Email note */}
          <div className="text-center text-[10px] sm:text-[11px] text-zinc-500 pt-1.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
            <span>Order tracking details dispatched via SMS & Email.</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
