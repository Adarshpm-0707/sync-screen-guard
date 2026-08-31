import React from 'react';
import { Search, Filter, X } from 'lucide-react';

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
  const statuses = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const payments = [
    { id: 'all', label: 'All Payment Types' },
    { id: 'cod', label: 'Cash on Delivery (COD)' },
    { id: 'razorpay', label: 'Prepaid (Razorpay)' },
  ];

  const customerTypes = [
    { id: 'all', label: 'All Customer Types' },
    { id: 'guest', label: '⚡ Guest Checkouts' },
    { id: 'registered', label: '👤 Registered Accounts' },
  ];

  return (
    <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-left">
      {/* Quick Status Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {statuses.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setStatusFilter(st.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === st.id
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/10'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Main Filter Bar: Search + Customer Type + Payment Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
        {/* Search Input */}
        <div className="lg:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, order ID..."
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Customer Type Dropdown */}
        {setCustomerTypeFilter && (
          <div className="lg:col-span-3">
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
            >
              {customerTypes.map((type) => (
                <option key={type.id} value={type.id} className="bg-[#0E1322] text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 px-3.5 py-2.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
          >
            {payments.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0E1322] text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
