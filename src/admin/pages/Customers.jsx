import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Zap, 
  IndianRupee, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Eye, 
  ShoppingCart,
  ShieldCheck,
  Award
} from 'lucide-react';
import useCustomers from '../hooks/useCustomers';
import StatCard from '../components/dashboard/StatCard';
import CustomerFilters from '../components/customers/CustomerFilters';
import CustomerDetailDrawer from '../components/customers/CustomerDetailDrawer';
import OrderDetailDrawer from '../components/orders/OrderDetailDrawer';
import AdminTable from '../components/common/AdminTable';
import Pagination from '../components/common/Pagination';

export default function Customers() {
  const {
    customers,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    customerType,
    setCustomerType,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    refresh
  } = useCustomers();

  // Drawer states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  const handleInspectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDrawerOpen(true);
  };

  const handleInspectOrder = (order) => {
    setSelectedOrder(order);
    setOrderDrawerOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const registeredPercent = stats.totalCustomers > 0 
    ? Math.round((stats.registeredCount / stats.totalCustomers) * 100) 
    : 0;

  const guestPercent = stats.totalCustomers > 0 
    ? Math.round((stats.guestCount / stats.totalCustomers) * 100) 
    : 0;

  const headers = ['Customer', 'Contact Credentials', 'Primary Location', 'Orders', 'Lifetime Spend', 'Last Active', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* ── Control Box Header ── */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Customers Directory
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Registered client accounts and guest purchasers registry ({totalItems} records displayed)
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all self-start sm:self-center cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── 4 Overview Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          description="All time client database"
          icon={Users}
          gradient="from-indigo-600 to-blue-600"
        />

        <StatCard
          title="Registered Accounts"
          value={stats.registeredCount}
          description={`${registeredPercent}% of client base`}
          icon={UserCheck}
          gradient="from-emerald-600 to-teal-600"
          badgeText="Verified"
        />

        <StatCard
          title="Guest Checkouts"
          value={stats.guestCount}
          description={`${guestPercent}% quick checkouts`}
          icon={Zap}
          gradient="from-amber-600 to-orange-600"
          badgeText="Instant"
        />

        <StatCard
          title="Total Lifetime Spend"
          value={`₹${stats.totalCustomerRevenue.toLocaleString()}`}
          description={`Avg ₹${stats.avgOrderValue} / order`}
          icon={IndianRupee}
          gradient="from-purple-600 to-pink-600"
        />
      </div>

      {/* ── Filters Bar ── */}
      <CustomerFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customerType={customerType}
        setCustomerType={setCustomerType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        stats={stats}
      />

      {/* ── Mobile Card View (< md) ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No customers match the active filters
          </div>
        ) : (
          customers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => handleInspectCustomer(cust)}
              className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-xs">
                    {getInitials(cust.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{cust.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cust.orders?.length || 0} order{cust.orders?.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  cust.is_guest
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {cust.is_guest ? '⚡ Guest' : '👤 Account'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {cust.email && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
                    <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                )}

                {cust.phone && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                )}

                {cust.primary_address && (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{cust.primary_address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Lifetime Spend</span>
                  <span className="font-black text-white text-sm">₹{Number(cust.total_spent || 0).toLocaleString()}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectCustomer(cust);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop Table View (>= md) ── */}
      <div className="hidden md:block">
        <AdminTable headers={headers} isLoading={loading} emptyMessage="No customers found matching search filters">
          {customers.map((cust) => (
            <tr
              key={cust.id}
              className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
              onClick={() => handleInspectCustomer(cust)}
            >
              {/* Customer Column */}
              <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-xs shadow-md">
                    {getInitials(cust.name)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">
                      {cust.name}
                    </span>
                    <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-widest mt-1 px-2 py-0.2 rounded-full border w-fit ${
                      cust.is_guest
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {cust.is_guest ? '⚡ Guest Checkout' : '👤 Registered Account'}
                    </span>
                  </div>
                </div>
              </td>

              {/* Contact Credentials */}
              <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-left">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                    {cust.email || 'No email provided'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {cust.phone || '—'}
                  </p>
                </div>
              </td>

              {/* Primary Location */}
              <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-left text-xs">
                {cust.addresses && cust.addresses.length > 0 ? (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-200">
                      {cust.addresses[0].city}, {cust.addresses[0].state}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      PIN: {cust.addresses[0].pincode}
                    </p>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs">No address recorded</span>
                )}
              </td>

              {/* Total Orders */}
              <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs">
                    {cust.total_orders}
                  </span>
                  {cust.total_orders > 1 && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Repeat
                    </span>
                  )}
                </div>
              </td>

              {/* Lifetime Spend */}
              <td className="px-4 sm:px-5 py-4 font-black text-white whitespace-nowrap text-xs text-left">
                ₹{Number(cust.total_spent || 0).toLocaleString()}
              </td>

              {/* Last Active */}
              <td className="px-4 sm:px-5 py-4 text-slate-400 whitespace-nowrap text-xs text-left">
                {new Date(cust.last_active).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>

              {/* Action */}
              <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-left">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectCustomer(cust);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Inspect</span>
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={10}
      />

      {/* ── Customer Detail Drawer ── */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          isOpen={customerDrawerOpen}
          onClose={() => {
            setCustomerDrawerOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onInspectOrder={handleInspectOrder}
        />
      )}

      {/* ── Order Detail Drawer (opened from inside customer history) ── */}
      {selectedOrder && (
        <OrderDetailDrawer
          isOpen={orderDrawerOpen}
          onClose={() => {
            setOrderDrawerOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          initialOrder={selectedOrder}
          onStatusUpdated={() => {
            refresh();
          }}
        />
      )}
    </div>
  );
}
