import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, CheckCircle, Package, Clock, ShieldCheck, 
  ArrowLeft, Cpu, Activity, Compass, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { restoreStockForCancelledOrder } from '../utils/stockManager';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserOrders();
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      handleTrack(urlOrderId);
    }
  }, [searchParams]);

  const fetchUserOrders = async () => {
    try {
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      setCustomerOrders(localSaved);
      if (localSaved.length > 0 && !searchParams.get('orderId')) {
        setOrderId(localSaved[0].id);
        buildTrackingView(localSaved[0]);
      }
    } catch (e) {
      console.error('Error fetching terminal signals:', e);
    }
  };

  const buildTrackingView = (orderObj) => {
    const statusMap = {
      pending: { label: 'Signal Received', progress: 1 },
      confirmed: { label: 'Validated', progress: 2 },
      processing: { label: 'Molecular Bonding', progress: 3 },
      shipped: { label: 'In Transit', progress: 4 },
      delivered: { label: 'Arrival Confirmed', progress: 5 },
    };

    const statusInfo = statusMap[orderObj.status] || { label: orderObj.status, progress: 2 };
    const dateStr = new Date(orderObj.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    setTrackingData({
      ...orderObj,
      statusLabel: statusInfo.label,
      progress: statusInfo.progress,
      milestones: [
        { label: 'Signal Initialization', desc: 'Order parameters locked into system.', date: dateStr, completed: statusInfo.progress >= 1 },
        { label: 'Lab Validation', desc: 'Inventory verified and assigned to terminal.', date: 'Sync OK', completed: statusInfo.progress >= 2 },
        { label: 'Quality Calibration', desc: 'EZ-Fit tray and glass ion check complete.', date: 'Sync OK', completed: statusInfo.progress >= 3 },
        { label: 'Dispatch Stream', desc: 'Unit transferred to logistics courier.', date: 'Active', completed: statusInfo.progress >= 4 },
        { label: 'Destination Arrival', desc: 'Secure hand-off at terminal address.', date: 'Pending', completed: statusInfo.progress >= 5 },
      ]
    });
  };

  const handleTrack = async (targetId) => {
    const idToQuery = targetId || orderId;
    if (!idToQuery.trim()) return setError('Enter valid Signal ID');

    setLoading(true);
    setError('');
    
    // Simulating system scan
    setTimeout(() => {
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const found = localSaved.find(o => o.id === idToQuery.trim());
      if (found) buildTrackingView(found);
      else setError('No signal found with this ID');
      setLoading(false);
    }, 800)
  };

  const handleCancelOrder = async () => {
    if (!trackingData) return;
    if (!window.confirm('Are you sure you want to cancel this order? Item stock will be automatically added back to inventory.')) {
      return;
    }

    const targetId = trackingData.id;
    try {
      // 1. Restore stock for items in cancelled order
      if (trackingData.items && trackingData.items.length > 0) {
        await restoreStockForCancelledOrder(trackingData.items);
      }

      // 2. Update status in Supabase
      try {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', targetId);
      } catch (e) {
        console.warn('Supabase order cancel status update warning:', e);
      }

      // 3. Update status in localStorage
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const updated = localSaved.map(o => o.id === targetId ? { ...o, status: 'cancelled' } : o);
      localStorage.setItem('customer_orders', JSON.stringify(updated));

      // 4. Update UI tracking state
      const updatedOrder = updated.find(o => o.id === targetId) || { ...trackingData, status: 'cancelled' };
      buildTrackingView(updatedOrder);
      setCustomerOrders(updated);
      alert('Order cancelled successfully. Purchased stock has been added back to inventory.');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order: ' + err.message);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-sky-100 text-sky-950 font-sans selection:bg-sky-300 overflow-hidden">
      
      {/* ── ATMOSPHERIC SKY BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-32 pb-20 space-y-12">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-600 text-sky-50 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg"
          >
            <Activity className="h-3 w-3" />
            <span>Terminal Status Monitor</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-sky-900 tracking-tighter uppercase leading-none">
            Track <span className="text-cyan-600 italic">Orders</span>
          </h1>
        </header>

        {/* Previous Signals Carousel */}
        {customerOrders.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-sky-200/40 backdrop-blur-3xl border border-sky-300/40 rounded-[40px] p-8 space-y-6 shadow-xl shadow-sky-400/10"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Active Signal Logs ({customerOrders.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customerOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => buildTrackingView(ord)}
                  className={`p-5 rounded-[24px] border text-left transition-all ${
                    trackingData?.id === ord.id
                      ? 'bg-sky-900 text-sky-100 border-sky-950 shadow-xl'
                      : 'bg-sky-300/20 border-sky-300/40 text-sky-900 hover:bg-sky-300/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase font-mono tracking-tighter">#{ord.id.slice(0, 8)}</span>
                    <span className="text-[9px] font-black uppercase bg-sky-500/20 px-2 py-1 rounded-lg">{ord.status}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-light tracking-tighter">₹{ord.total}</p>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Tactical Search Interface */}
        <section className="bg-sky-200/50 backdrop-blur-3xl border border-sky-400/40 rounded-[32px] p-4 sm:p-5 shadow-2xl shadow-sky-400/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
              <input
                type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Signal ID (e.g. SKY-XXXXXX)"
                className="w-full rounded-2xl bg-sky-300/20 border border-sky-400/30 py-4 pl-12 pr-4 text-sm font-bold text-sky-950 focus:bg-sky-300/40 focus:outline-none transition-all placeholder:text-sky-400"
              />
            </div>
            <button
              onClick={() => handleTrack()}
              disabled={loading}
              className="px-10 py-4 bg-sky-900 text-sky-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-sky-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Sync Status'}
            </button>
          </div>
          {error && <p className="text-[10px] text-red-500 font-black uppercase mt-3 tracking-tighter ml-2">{error}</p>}
        </section>

        {/* Tracking Conduit Visualization */}
        <AnimatePresence mode="wait">
          {trackingData && (
            <motion.div 
              key={trackingData.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-sky-900 rounded-[50px] border border-sky-500/30 p-8 sm:p-12 space-y-12 shadow-2xl shadow-sky-900/40"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-sky-500/20 pb-8">
                <div className="space-y-1">
                  <span className="text-[9px] text-sky-400 font-black uppercase tracking-[0.3em]">Protocol Reference</span>
                  <h3 className="text-xl font-bold text-sky-100 tracking-tight">{trackingData.id}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] text-sky-400 font-black uppercase">Current Node</p>
                    <p className="text-sm font-bold text-sky-100">{trackingData.statusLabel}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                    <Compass className="h-6 w-6 text-sky-400 animate-spin-slow" />
                  </div>
                </div>
              </div>

              {/* Progress Conduit */}
              <div className="relative border-l-2 border-sky-800 ml-4 space-y-10">
                {trackingData.milestones.map((milestone, idx) => (
                  <div key={idx} className="relative pl-10 group">
                    {/* Glowing Node */}
                    <div
                      className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-700 ${
                        milestone.completed
                          ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                          : 'border-sky-800 bg-sky-950'
                      }`}
                    >
                      {milestone.completed && <CheckCircle className="h-3 w-3 text-sky-950" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${milestone.completed ? 'text-sky-100' : 'text-sky-700'}`}>
                        {milestone.label}
                      </h4>
                      <p className="text-sm font-medium text-sky-400 leading-snug max-w-sm">
                        {milestone.desc}
                      </p>
                      <span className="block text-[9px] font-black text-sky-500 uppercase tracking-widest mt-2">
                        {milestone.completed ? milestone.date : '---'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Node */}
              <div className="bg-sky-950/50 rounded-[32px] p-8 border border-sky-500/10 flex flex-wrap justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-xl">
                       <ShieldCheck className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-sky-500 uppercase">Integrity Status</p>
                       <p className="text-xs font-bold text-sky-100">Sync-Check Passed</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-sky-500 uppercase">Unit Total</p>
                    <p className="text-xl font-light text-sky-100 tracking-tighter">₹{trackingData.total}</p>
                 </div>
              </div>

              {/* Cancel Order Option for Active Customer Orders */}
              {trackingData.status !== 'delivered' && trackingData.status !== 'cancelled' && (
                <div className="pt-4 border-t border-sky-500/20 flex justify-end">
                  <button
                    onClick={handleCancelOrder}
                    className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    🚫 Cancel Order & Restore Stock
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}