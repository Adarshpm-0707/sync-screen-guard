import React from 'react';
import { Search, X, Users, UserCheck, Zap, ArrowUpDown } from 'lucide-react';

export default function CustomerFilters({
  searchTerm,
  setSearchTerm,
  customerType,
  setCustomerType,
  sortBy,
  setSortBy,
  stats = {}
}) {
  const customerTabs = [
    { id: 'all', label: 'All Customers', icon: Users, count: stats.totalCustomers },
    { id: 'registered', label: '👤 Registered Accounts', icon: UserCheck, count: stats.registeredCount },
    { id: 'guest', label: '⚡ Guest Checkouts', icon: Zap, count: stats.guestCount },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Sort: Most Recent Activity' },
    { id: 'spent', label: 'Sort: Highest Spend (LTV)' },
    { id: 'orders', label: 'Sort: Most Orders Placed' },
    { id: 'name', label: 'Sort: Customer Name (A-Z)' },
  ];

  return (
    <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-left">
      {/* Customer Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {customerTabs.map((tab) => {
          const isActive = customerType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCustomerType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/10'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Filter Row: Search + Sort Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        {/* Search Bar */}
        <div className="sm:col-span-8 lg:col-span-9 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, phone number, city, or pincode..."
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

        {/* Sort Select */}
        <div className="sm:col-span-4 lg:col-span-3 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 px-3.5 py-2.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#0E1322] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
