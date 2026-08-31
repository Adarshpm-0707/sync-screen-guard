import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingCart, 
  IndianRupee, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Package,
  Award
} from 'lucide-react';
import OrderStatusBadge from '../orders/OrderStatusBadge';

export default function CustomerDetailDrawer({ isOpen, onClose, customer, onInspectOrder }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !customer) return null;

  const isGuest = customer.is_guest;
  const avgOrderValue = customer.total_orders > 0 
    ? Math.round(customer.total_spent / customer.total_orders) 
    : 0;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getTier = () => {
    if (customer.total_orders >= 3 || customer.total_spent >= 1500) {
      return { label: 'VIP Customer', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    }
    if (customer.total_orders > 1) {
      return { label: 'Returning Customer', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
    }
    return { label: 'First-time Customer', color: 'text-slate-400 border-slate-700 bg-slate-800/60' };
  };

  const tier = getTier();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-left animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0E1322] border-l border-slate-800/80 shadow-2xl flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-[#0B0F19]/80 sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-lg shadow-lg ring-1 ring-white/20">
                {getInitials(customer.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-white uppercase truncate max-w-xs">
                    {customer.name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isGuest 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isGuest ? <Zap className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                    {isGuest ? 'Guest Checkout' : 'Registered Account'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                  Customer ID: <span className="font-mono text-indigo-400 font-bold">{customer.id.slice(0, 14)}...</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Spent</span>
                <p className="text-lg font-black text-white">₹{Number(customer.total_spent || 0).toLocaleString()}</p>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">Lifetime Value</span>
              </div>

              <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
                <p className="text-lg font-black text-white">{customer.total_orders}</p>
                <span className="text-[9px] font-bold text-indigo-400 uppercase">{customer.total_orders > 1 ? 'Repeat Buyer' : '1 Order'}</span>
              </div>

              <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avg Order</span>
                <p className="text-lg font-black text-white">₹{avgOrderValue.toLocaleString()}</p>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Per Purchase</span>
              </div>

              <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Loyalty Tier</span>
                <p className="text-xs font-black text-amber-300 truncate pt-1">{tier.label}</p>
                <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${tier.color}`}>
                  Verified
                </span>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Contact Credentials</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  First Seen: {new Date(customer.first_seen).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Email */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</span>
                    <p className="font-bold text-white truncate text-xs">{customer.email || 'Not provided'}</p>
                  </div>
                  {customer.email && (
                    <button
                      onClick={() => handleCopy(customer.email, 'email')}
                      className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number</span>
                    <p className="font-bold text-white font-mono text-xs">{customer.phone || 'Not provided'}</p>
                  </div>
                  {customer.phone && (
                    <button
                      onClick={() => handleCopy(customer.phone, 'phone')}
                      className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Phone"
                    >
                      {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Addresses Card */}
            <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Shipping Addresses ({customer.addresses?.length || 0})
                </h3>
              </div>

              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-2">
                  {customer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {idx === 0 ? 'Primary / Latest' : `Address #${idx + 1}`}
                          </span>
                          <span className="font-bold text-slate-200">{addr.city}, {addr.state}</span>
                        </div>
                        <p className="text-slate-400 font-medium pt-1 leading-relaxed">{addr.address}</p>
                        <p className="text-slate-500 font-mono text-[11px]">PIN: {addr.pincode}</p>
                      </div>

                      <button
                        onClick={() => handleCopy(`${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`, `addr-${idx}`)}
                        className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copy full address"
                      >
                        {copiedField === `addr-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium py-2">No registered shipping address found.</p>
              )}
            </div>

            {/* Complete Order History */}
            <div className="bg-[#090D16]/90 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-blue-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Full Order History ({customer.orders?.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Last active: {new Date(customer.last_active).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-2.5">
                  {customer.orders.map((order) => (
                    <div 
                      key={order.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-indigo-400">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="uppercase font-bold text-slate-300">
                            {order.payment_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <span className="font-black text-white text-sm">
                          ₹{Number(order.total || 0).toLocaleString()}
                        </span>
                        {onInspectOrder && (
                          <button
                            onClick={() => {
                              onInspectOrder(order);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium py-2">No orders recorded for this customer.</p>
              )}
            </div>

          </div>

          {/* Quick Action Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0B0F19]/90 sticky bottom-0 z-20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send Email</span>
                </a>
              )}
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Customer</span>
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
