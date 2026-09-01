import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Box, 
  CreditCard, 
  CheckCircle2, 
  Ban, 
  Truck,
  Phone,
  Mail,
  PackageCheck,
  Calendar
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { restoreStockForCancelledOrder } from '../../utils/stockManager';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import AdminButton from '../components/common/AdminButton';
import { getAdminAuthHeaders } from '../utils/adminAuth';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const headers = await getAdminAuthHeaders();

      let fetched = null;
      try {
        const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
          headers,
        });
        if (res.ok) {
          fetched = await res.json();
        }
      } catch (e) {}

      if (fetched && fetched.id) {
        setOrder(fetched);
      } else {
        const { data: dbOrder } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
        if (dbOrder) {
          const { data: dbItems } = await supabase.from('order_items').select('*').eq('order_id', id);
          setOrder({
            ...dbOrder,
            items: dbItems || [{ id: '1', product_name: 'Sync Screenguard', quantity: 1, price: dbOrder.total }]
          });
        }
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });

      try {
        await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {}

      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (newStatus === 'cancelled' && order?.items && order.items.length > 0) {
        await restoreStockForCancelledOrder(order.items);
      }

      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const updatedLocals = localSaved.map(o => o.id === id ? { ...o, status: newStatus } : o);
      localStorage.setItem('customer_orders', JSON.stringify(updatedLocals));

      await fetchOrderDetail();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentStepIdx = statusSteps.indexOf(order?.status?.toLowerCase());

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Back button & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center space-x-2 text-xs font-bold text-indigo-400 hover:text-white transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="font-display text-xl sm:text-2xl font-black text-white uppercase">
              Order Audit #{id?.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Verified purchase record and fulfillment ledger
          </p>
        </div>

        {order && (
          <div className="flex items-center space-x-3 self-start sm:self-center">
            <OrderStatusBadge status={order.status} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0E1322]/80 border border-slate-800 rounded-3xl">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading order record...</span>
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Blocks (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fulfillment Status Stepper */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Fulfillment Status
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Placed: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              {order.status !== 'cancelled' ? (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {statusSteps.map((step, idx) => {
                    const isComplete = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step} className="space-y-2 text-center">
                        <div className={`h-2 rounded-full transition-all ${
                          isComplete ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-800'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          isCurrent ? 'text-indigo-400' : isComplete ? 'text-slate-200' : 'text-slate-600'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                  This transaction has been cancelled.
                </div>
              )}
            </div>

            {/* Customer Profile */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2.5 text-xs font-black uppercase tracking-wider text-slate-300">
                  <User className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Customer Profile</span>
                </div>
                <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  order.is_guest || !order.user_id
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {order.is_guest || !order.user_id ? '⚡ Guest Checkout Customer' : '👤 Registered Account'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Customer Name:</span>
                  <span className="font-bold text-white text-sm">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Phone Number:</span>
                  <a href={`tel:${order.phone}`} className="font-mono font-bold text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {order.phone}
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-semibold block mb-0.5">Email Address:</span>
                  <span className="font-bold text-slate-300">{order.customer_email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2.5 text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-3">
                <MapPin className="h-4.5 w-4.5 text-indigo-400" />
                <span>Delivery Destination</span>
              </div>
              <div className="text-xs space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Street Address</span>
                  <span className="font-semibold text-white text-sm">{order.address}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">City</span>
                    <span className="font-semibold text-white">{order.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">State</span>
                    <span className="font-semibold text-white">{order.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Pincode</span>
                    <span className="font-mono text-white font-bold">{order.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Manifest */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2.5 text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-3">
                <Box className="h-4.5 w-4.5 text-indigo-400" />
                <span>Product Manifest</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white text-sm">{item.product_name || 'Sync Guard'}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Model: {item.selectedModel || item.model || 'Universal'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Quantity: x{item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-white text-sm">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Invoice & Actions */}
          <div className="space-y-6">
            
            {/* Invoice Totals */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-3">
                Order Financials
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cart Subtotal:</span>
                  <span className="font-bold text-white">₹{Number(order.total - (order.cod_fee || 0)).toLocaleString()}</span>
                </div>
                {order.cod_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">COD Handling Fee:</span>
                    <span className="font-bold text-white">₹{Number(order.cod_fee).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping Charge:</span>
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">Free</span>
                </div>
                <div className="border-t border-slate-800/80 pt-3 flex justify-between text-base font-black text-white">
                  <span>Grand Total:</span>
                  <span className="text-indigo-400">₹{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-3">
                <CreditCard className="h-4.5 w-4.5 text-indigo-400" />
                <span>Payment Details</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-black text-white uppercase">{order.payment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold uppercase ${
                    order.payment_status === 'success' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>{order.payment_status || 'pending'}</span>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-3">
                Workflow Actions
              </h3>
              <div className="flex flex-col space-y-2.5">
                {order.status === 'pending' && (
                  <AdminButton
                    variant="success"
                    onClick={() => updateOrderStatus('confirmed')}
                    isLoading={isUpdating}
                    className="w-full py-3"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Transaction
                  </AdminButton>
                )}
                {order.status === 'confirmed' && (
                  <AdminButton
                    variant="primary"
                    onClick={() => updateOrderStatus('shipped')}
                    isLoading={isUpdating}
                    className="w-full py-3"
                  >
                    <Truck className="h-4 w-4 mr-2" /> Mark as Shipped
                  </AdminButton>
                )}
                {order.status === 'shipped' && (
                  <AdminButton
                    variant="success"
                    onClick={() => updateOrderStatus('delivered')}
                    isLoading={isUpdating}
                    className="w-full py-3"
                  >
                    <PackageCheck className="h-4 w-4 mr-2" /> Mark as Delivered
                  </AdminButton>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <AdminButton
                    variant="danger"
                    onClick={() => updateOrderStatus('cancelled')}
                    isLoading={isUpdating}
                    className="w-full py-3"
                  >
                    <Ban className="h-4 w-4 mr-2" /> Cancel Transaction
                  </AdminButton>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0E1322] border border-slate-800 rounded-3xl text-slate-500">
          Order not found.
        </div>
      )}
    </div>
  );
}
