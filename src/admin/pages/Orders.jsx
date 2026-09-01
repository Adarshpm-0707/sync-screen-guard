import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  ShoppingCart, 
  Eye, 
  Phone, 
  Calendar, 
  User, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import OrderFilters from '../components/orders/OrderFilters';
import AdminTable from '../components/common/AdminTable';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import Pagination from '../components/common/Pagination';
import OrderDetailDrawer from '../components/orders/OrderDetailDrawer';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';
import { deleteOrder, filterDeletedOrders } from '../../utils/orderManager';

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Drawer states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchOrders();

    const handleOrdersUpdated = () => {
      fetchOrders();
    };
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdated);
    };
  }, [currentPage, statusFilter, paymentFilter, customerTypeFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const headers = await getAdminAuthHeaders();

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        payment: paymentFilter,
        customerType: customerTypeFilter,
        search: searchTerm,
      });

      let fetchedOrders = null;
      try {
        const res = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          fetchedOrders = Array.isArray(data.orders) ? filterDeletedOrders(data.orders) : [];
          setTotalPages(data.totalPages || Math.ceil(fetchedOrders.length / itemsPerPage) || 1);
          setTotalItems(data.totalItems || fetchedOrders.length || 0);
        }
      } catch (apiErr) {
        console.warn('API fetchOrders fallback:', apiErr);
      }

      if (Array.isArray(fetchedOrders) && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      } else {
        // Direct Supabase query
        let query = supabase.from('orders').select('*', { count: 'exact' });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (paymentFilter !== 'all') query = query.eq('payment_type', paymentFilter);
        if (customerTypeFilter !== 'all') {
          if (customerTypeFilter === 'guest') {
            query = query.or('is_guest.eq.true,user_id.is.null');
          } else if (customerTypeFilter === 'registered') {
            query = query.eq('is_guest', false).not('user_id', 'is', null);
          }
        }
        
        const { data: dbOrders, count } = await query.order('created_at', { ascending: false });
        let allOrders = dbOrders || [];

        // Combine with any locally placed purchases in localStorage
        const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        if (localSaved.length > 0) {
          const existingIds = new Set(allOrders.map(o => o.id));
          const newLocals = localSaved.filter(o => !existingIds.has(o.id));
          allOrders = [...newLocals, ...allOrders];
        }

        // Filter out any deleted orders
        allOrders = filterDeletedOrders(allOrders);

        if (customerTypeFilter !== 'all') {
          if (customerTypeFilter === 'guest') {
            allOrders = allOrders.filter(o => o.is_guest || !o.user_id);
          } else if (customerTypeFilter === 'registered') {
            allOrders = allOrders.filter(o => !o.is_guest && o.user_id);
          }
        }

        if (searchTerm) {
          allOrders = allOrders.filter(o =>
            (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.phone && o.phone.includes(searchTerm)) ||
            (o.id && String(o.id).toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setOrders(allOrders);
        setTotalItems(allOrders.length);
        setTotalPages(Math.ceil(allOrders.length / itemsPerPage) || 1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleStatusUpdated = () => {
    fetchOrders();
  };

  const handleDeleteOrder = async (e, order) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!order || !order.id) return;

    const orderDisplayId = String(order.id).slice(0, 8).toUpperCase();
    if (!window.confirm(`Permanently delete order #${orderDisplayId}?\nThis action cannot be undone.`)) return;

    // Optimistic UI state update
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    setTotalItems((prev) => Math.max(0, prev - 1));
    if (selectedOrder?.id === order.id) {
      setDrawerOpen(false);
      setSelectedOrder(null);
    }

    try {
      await deleteOrder(order.id);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order. Please try again.');
      fetchOrders();
    }
  };

  const headers = ['Order ID', 'Date', 'Customer', 'Contact', 'Payment', 'Status', 'Total', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Control Box Header */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Orders Registry
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Track customer transactions, fulfillments & delivery statuses ({totalItems} records found)
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all self-start sm:self-center cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Component */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        paymentFilter={paymentFilter}
        setPaymentFilter={(payment) => {
          setPaymentFilter(payment);
          setCurrentPage(1);
        }}
        customerTypeFilter={customerTypeFilter}
        setCustomerTypeFilter={(type) => {
          setCustomerTypeFilter(type);
          setCurrentPage(1);
        }}
      />

      {/* Mobile Card View (< sm/md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No orders match search filters
          </div>
        ) : (
          orders.map((order) => {
            const isGuestOrder = order.is_guest || !order.user_id;

            return (
              <div
                key={order.id}
                onClick={() => handleRowClick(order)}
                className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="font-mono text-xs font-black text-indigo-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{order.customer_name}</span>
                    <span className="font-black text-white text-sm">₹{Number(order.total || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {order.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isGuestOrder
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isGuestOrder ? '⚡ Guest' : '👤 Account'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-black uppercase text-slate-300">
                      {order.payment_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(order);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-wider"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={(e) => handleDeleteOrder(e, order)}
                    className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <AdminTable headers={headers} isLoading={loading} emptyMessage="No orders match search filters">
          {orders.map((order) => {
            const isGuestOrder = order.is_guest || !order.user_id;

            return (
              <tr 
                key={order.id} 
                className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                onClick={() => handleRowClick(order)}
              >
                <td className="px-4 sm:px-5 py-4 font-black font-mono text-indigo-400 whitespace-nowrap">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 sm:px-5 py-4 text-slate-400 whitespace-nowrap text-xs">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white max-w-[160px] truncate text-xs">
                      {order.customer_name}
                    </span>
                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full border w-fit ${
                      isGuestOrder
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isGuestOrder ? '⚡ Guest' : '👤 Account'}
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-slate-300 font-mono text-xs">
                  {order.phone}
                </td>
                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-slate-300 tracking-wider">
                    {order.payment_type}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 sm:px-5 py-4 font-black text-white whitespace-nowrap text-xs">
                  ₹{Number(order.total || 0).toLocaleString()}
                </td>
                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(order);
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={(e) => handleDeleteOrder(e, order)}
                      title="Delete order"
                      className="p-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/25 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Order detail drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          initialOrder={selectedOrder}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
