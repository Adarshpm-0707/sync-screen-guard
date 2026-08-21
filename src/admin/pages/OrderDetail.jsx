import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Box, CreditCard, CheckCircle2, Ban, Truck } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import AdminButton from '../components/common/AdminButton';

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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        await fetchOrderDetail();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Back button & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders List</span>
          </button>
          <h1 className="font-display text-2xl font-extrabold text-white">Order Details</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Audit customer purchase details</p>
        </div>

        {order && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Current Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-slate-900 border border-slate-800 rounded-3xl">
          <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-semibold text-slate-500 uppercase tracking-widest text-[9px]">Decrypting transaction...</span>
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Blocks (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
                <User className="h-4.5 w-4.5 text-indigo-400" />
                <span>Customer Profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Name:</span>{' '}
                  <span className="font-bold text-white block mt-0.5">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>{' '}
                  <span className="font-bold text-white block mt-0.5">{order.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Email Address:</span>{' '}
                  <span className="font-bold text-white block mt-0.5">{order.customer_email || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
                <MapPin className="h-4.5 w-4.5 text-indigo-400" />
                <span>Delivery Destination</span>
              </div>
              <div className="text-xs space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Street Address</span>
                  <span className="font-semibold text-white">{order.address}</span>
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
                    <span className="font-semibold text-white">{order.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
                <Box className="h-4.5 w-4.5 text-indigo-400" />
                <span>Product Manifest</span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">{item.product_name || 'Sync Guard'}</span>
                      <span className="text-[10px] text-slate-500 ml-2">(x{item.quantity})</span>
                    </div>
                    <span className="font-extrabold text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Checkout Totals & Status Updates (Right Column) */}
          <div className="space-y-6">
            
            {/* Invoice Totals */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">Order Invoice</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cart Subtotal:</span>
                  <span className="font-bold text-white">₹{order.total - (order.cod_fee || 0)}</span>
                </div>
                {order.cod_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">COD Handling Fee:</span>
                    <span className="font-bold text-white">₹{order.cod_fee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping:</span>
                  <span className="font-bold text-emerald-500 uppercase text-[10px]">Free</span>
                </div>
                <div className="border-t border-slate-800 pt-3.5 flex justify-between text-sm font-black text-white">
                  <span>Grand Total:</span>
                  <span className="text-primary-500">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Payment Audit */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
                <CreditCard className="h-4.5 w-4.5 text-indigo-400" />
                <span>Payment Audit</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-white uppercase">{order.payment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold uppercase ${
                    order.payment_status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>{order.payment_status || 'pending'}</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">Administrative Actions</h3>
              <div className="flex flex-col space-y-3">
                {order.status === 'pending' && (
                  <AdminButton
                    variant="success"
                    onClick={() => updateOrderStatus('confirmed')}
                    isLoading={isUpdating}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Transaction
                  </AdminButton>
                )}
                {order.status === 'confirmed' && (
                  <AdminButton
                    variant="primary"
                    onClick={() => updateOrderStatus('shipped')}
                    isLoading={isUpdating}
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" /> Mark as Shipped
                  </AdminButton>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <AdminButton
                    variant="danger"
                    onClick={() => updateOrderStatus('cancelled')}
                    isLoading={isUpdating}
                    className="w-full"
                  >
                    <Ban className="h-4 w-4 mr-2" /> Cancel Transaction
                  </AdminButton>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">Order not found.</div>
      )}
    </div>
  );
}
