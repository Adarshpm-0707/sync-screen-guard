import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Box, 
  Truck, 
  CheckCircle2, 
  Ban,
  Clock,
  ChevronRight,
  ExternalLink,
  PackageCheck,
  Trash2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { restoreStockForCancelledOrder } from '../../../utils/stockManager';
import OrderStatusBadge from './OrderStatusBadge';
import AdminButton from '../common/AdminButton';
import { getAdminAuthHeaders } from '../../utils/adminAuth';
import { deleteOrder, isOrderDeleted } from '../../../utils/orderManager';
import { sendOrderCancellationEmails } from '../../../utils/orderEmailNotification';

export default function OrderDetailDrawer({ isOpen, onClose, orderId, initialOrder, onStatusUpdated }) {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(initialOrder || null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      if (isOrderDeleted(orderId)) {
        onClose();
        return;
      }
      if (initialOrder && initialOrder.id === orderId) {
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
      const headers = await getAdminAuthHeaders();

      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers,
      });
      if (res.ok) {
        fetched = await res.json();
      }
    } catch (err) {
      console.warn('API fetchOrderDetail fallback:', err);
    }

    if (fetched && fetched.id) {
      setOrder(fetched);
    } else if (initialOrder) {
      setOrder(initialOrder);
    } else {
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
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });

      try {
        await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {}

      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (newStatus === 'cancelled') {
        if (order?.items && order.items.length > 0) {
          await restoreStockForCancelledOrder(order.items);
        }
        sendOrderCancellationEmails({
          ...order,
          orderId: orderId,
          status: 'cancelled'
        });
      }

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

  const handleShipWithShiprocket = async () => {
    setIsUpdating(true);
    try {
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('http://localhost:5000/api/admin/shipments', {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId })
      });

      if (res.ok) {
        setOrder(prev => prev ? { ...prev, status: 'shipped' } : null);
        if (onStatusUpdated) onStatusUpdated();
      } else {
        await updateOrderStatus('shipped');
      }
    } catch (e) {
      await updateOrderStatus('shipped');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order || !order.id) return;
    const orderDisplayId = String(order.id).slice(0, 8).toUpperCase();
    if (!window.confirm(`Permanently delete order #${orderDisplayId}?\nThis action cannot be undone.`)) return;

    setIsUpdating(true);
    try {
      await deleteOrder(order.id);
      onClose();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  // Milestone timeline calculation
  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentStepIdx = statusSteps.indexOf(order?.status?.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#0E1322] border-l border-slate-800/90 h-full flex flex-col shadow-2xl z-10 text-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4.5 border-b border-slate-800/90 bg-[#090D16]/60 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Order Inspection</h3>
            </div>
            <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
              ID: #{String(orderId || '').slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteOrder}
              disabled={isUpdating}
              title="Delete Order Permanently"
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Decrypting transaction...</span>
            </div>
          ) : order ? (
            <>
              {/* Order Status & Progress Stepper */}
              <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Fulfillment Progress
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                {order.status !== 'cancelled' ? (
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {statusSteps.map((step, idx) => {
                      const isComplete = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={step} className="space-y-1.5 text-center">
                          <div className={`h-1.5 rounded-full transition-all ${
                            isComplete ? 'bg-indigo-500' : 'bg-slate-800'
                          }`} />
                          <span className={`text-[8px] font-black uppercase tracking-wider block truncate ${
                            isCurrent ? 'text-indigo-400' : isComplete ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                    ❌ This order was cancelled
                  </div>
                )}
              </div>

              {/* Customer Info Card */}
              <div className="border border-slate-800/80 bg-[#090D16]/90 rounded-2xl p-4.5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>Customer Profile</span>
                  </div>
                  <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    order.is_guest || !order.user_id
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {order.is_guest || !order.user_id ? '⚡ Guest' : '👤 Registered'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Name:</span>
                    <span className="font-bold text-white text-right">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Phone:</span>
                    <a 
                      href={`tel:${order.phone}`}
                      className="font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {order.phone}
                    </a>
                  </div>
                  {order.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Email:</span>
                      <span className="font-bold text-slate-300 text-right truncate max-w-[200px]">{order.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="border border-slate-800/80 bg-[#090D16]/90 rounded-2xl p-4.5 space-y-2.5 shadow-md">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <p className="font-medium text-white">{order.address}</p>
                  <p className="font-semibold text-slate-400">{order.city}, {order.state} - <span className="font-mono text-white font-bold">{order.pincode}</span></p>
                </div>
              </div>

              {/* Order Items Manifest */}
              <div className="border border-slate-800/80 bg-[#090D16]/90 rounded-2xl p-4.5 space-y-3 shadow-md">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <Box className="h-4 w-4 text-indigo-400" />
                  <span>Items Manifest</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.product_name || item.name || 'Sync Guard'}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                            {item.selectedModel || item.model || 'Universal Fit'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-black text-white text-xs">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice & Payment Audit */}
              <div className="border border-slate-800/80 bg-[#090D16]/90 rounded-2xl p-4.5 space-y-2.5 shadow-md">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <span>Financial Breakdown</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Gateway:</span>
                    <span className="font-black text-white uppercase">{order.payment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-bold text-white">₹{Number(order.total - (order.cod_fee || 0)).toLocaleString()}</span>
                  </div>
                  {order.cod_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">COD Fee:</span>
                      <span className="font-bold text-white">₹{Number(order.cod_fee).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping:</span>
                    <span className="font-black text-emerald-400 uppercase text-[10px]">Free</span>
                  </div>
                  <div className="border-t border-slate-800/80 pt-2 flex justify-between text-sm font-black text-white">
                    <span>Grand Total:</span>
                    <span className="text-indigo-400">₹{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Failed to load order.</div>
          )}
        </div>

        {/* Actions Footer */}
        {order && !loading && (
          <div className="p-4 sm:p-6 border-t border-slate-800/90 bg-[#090D16]/80 flex flex-col sm:flex-row gap-2.5 shrink-0">
            {order.status === 'pending' && (
              <>
                <AdminButton
                  variant="success"
                  onClick={() => updateOrderStatus('confirmed')}
                  isLoading={isUpdating}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Order
                </AdminButton>
                <AdminButton
                  variant="primary"
                  onClick={handleShipWithShiprocket}
                  isLoading={isUpdating}
                  className="flex-1"
                >
                  <Truck className="h-4 w-4 mr-2" /> Ship with Shiprocket
                </AdminButton>
              </>
            )}
            {order.status === 'confirmed' && (
              <AdminButton
                variant="primary"
                onClick={handleShipWithShiprocket}
                isLoading={isUpdating}
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-2" /> Ship with Shiprocket
              </AdminButton>
            )}
            {order.status === 'shipped' && (
              <AdminButton
                variant="success"
                onClick={() => updateOrderStatus('delivered')}
                isLoading={isUpdating}
                className="flex-1"
              >
                <PackageCheck className="h-4 w-4 mr-2" /> Mark as Delivered
              </AdminButton>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <AdminButton
                variant="danger"
                onClick={() => updateOrderStatus('cancelled')}
                isLoading={isUpdating}
                className="flex-1"
              >
                <Ban className="h-4 w-4 mr-2" /> Cancel
              </AdminButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
