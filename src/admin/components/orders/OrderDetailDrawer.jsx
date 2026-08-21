import React, { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, CreditCard, Box, Truck, CheckCircle2, Ban } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import OrderStatusBadge from './OrderStatusBadge';
import AdminButton from '../common/AdminButton';

export default function OrderDetailDrawer({ isOpen, onClose, orderId, initialOrder, onStatusUpdated }) {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(initialOrder || null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      if (initialOrder) {
        setOrder(initialOrder);
        setLoading(false);
      } else {
        fetchOrderDetail();
      }
    }
  }, [isOpen, orderId, initialOrder]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    let fetched = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetched = await res.json();
      }
    } catch (err) {
      console.warn('API fetchOrderDetail failed, using fallback:', err);
    }

    if (fetched && fetched.id) {
      setOrder(fetched);
    } else if (initialOrder) {
      setOrder(initialOrder);
    } else {
      // Supabase query fallback
      try {
        const { data: dbOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (dbOrder) {
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

          setOrder({
            ...dbOrder,
            items: dbItems || [
              { id: '1', product_name: 'Sync EZ Fit Glass Screenguard', quantity: 1, price: dbOrder.total }
            ]
          });
        } else {
          // localStorage fallback
          const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
          const found = localSaved.find(o => o.id === orderId);
          if (found) {
            setOrder({
              ...found,
              items: found.items || [
                { id: '1', product_name: 'Sync EZ Fit Glass Screenguard', quantity: 1, price: found.total }
              ]
            });
          }
        }
      } catch (e) {
        console.error('Fallback order fetch failed:', e);
      }
    }
    setLoading(false);
  };

  const updateOrderStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let success = false;
      try {
        const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) success = true;
      } catch (e) {
        console.warn('API status update failed, updating via Supabase:', e);
      }

      // Update Supabase directly
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      // Update localStorage fallback
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const updatedLocals = localSaved.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('customer_orders', JSON.stringify(updatedLocals));

      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 text-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/20 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Audit</h3>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">ID: #{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold text-slate-500 uppercase tracking-widest text-[9px]">Decrypting transaction...</span>
            </div>
          ) : order ? (
            <>
              {/* Customer Info Card */}
              <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span>Customer Profile</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="font-bold text-white">{order.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-bold text-white">{order.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="font-bold text-white">{order.customer_email || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>Delivery Address</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <p className="font-medium">{order.address}</p>
                  <p className="font-medium">{order.city}, {order.state} - {order.pincode}</p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <Box className="h-4 w-4 text-indigo-400" />
                  <span>Items Ordered</span>
                </div>
                <div className="divide-y divide-slate-800/40">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.product_name || item.name || 'Sync Guard'}</span>
                        <span className="text-[10px] text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded border border-primary-500/20 inline-block mt-0.5">
                          Model: {item.selectedModel || item.model || 'iPhone 15 Pro'}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">(x{item.quantity})</span>
                      </div>
                      <span className="font-extrabold text-white">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice / Pricing Details */}
              <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-bold text-white">₹{order.total - (order.cod_fee || 0)}</span>
                </div>
                {order.cod_fee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">COD Fee:</span>
                    <span className="font-bold text-white">₹{order.cod_fee}</span>
                  </div>
                )}
                <div className="border-t border-slate-800/60 pt-3 flex justify-between text-sm font-black text-white">
                  <span>Grand Total:</span>
                  <span className="text-primary-500">₹{order.total}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border border-slate-800/80 bg-slate-950/20 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <span>Payment Ledger</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-bold text-white uppercase">{order.payment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Status:</span>
                    <span className={`font-bold uppercase ${
                      order.payment_status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>{order.payment_status || 'pending'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Failed to load order.</div>
          )}
        </div>

        {/* Drawer Actions Footer */}
        {order && !loading && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/40 grid grid-cols-2 gap-3.5 shrink-0">
            {order.status === 'pending' && (
              <AdminButton
                variant="success"
                onClick={() => updateOrderStatus('confirmed')}
                isLoading={isUpdating}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Order
              </AdminButton>
            )}
            {order.status === 'confirmed' && (
              <AdminButton
                variant="primary"
                onClick={() => updateOrderStatus('shipped')}
                isLoading={isUpdating}
                className="w-full"
              >
                <Truck className="h-4 w-4 mr-2" /> Mark Shipped
              </AdminButton>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <AdminButton
                variant="danger"
                onClick={() => updateOrderStatus('cancelled')}
                isLoading={isUpdating}
                className="w-full col-span-2"
              >
                <Ban className="h-4 w-4 mr-2" /> Cancel Transaction
              </AdminButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
