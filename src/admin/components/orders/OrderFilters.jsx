import React from 'react';
import { Search } from 'lucide-react';

export default function OrderFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  customerTypeFilter = 'all',
  setCustomerTypeFilter,
}) {
  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const payments = ['all', 'cod', 'razorpay'];
  const customerTypes = ['all', 'guest', 'registered'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-left">
      {/* Search Input */}
      <div className="relative w-full md:flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, phone..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-white focus:border-primary-500/80 focus:outline-none transition-colors"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {setCustomerTypeFilter && (
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[8px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Customer Type</label>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-amber-300 focus:border-amber-500 focus:outline-none transition-colors capitalize font-bold"
            >
              {customerTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-900 capitalize text-white">
                  {type === 'all' ? 'All Customers' : type === 'guest' ? '⚡ Guest Purchases' : '👤 Registered Accounts'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 sm:flex-initial">
          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Order Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none transition-colors capitalize"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-slate-900 capitalize">
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:flex-initial">
          <label className="block text-[8px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Payment</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none transition-colors uppercase"
          >
            {payments.map((p) => (
              <option key={p} value={p} className="bg-slate-900 uppercase">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
