import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import OrderFilters from '../components/orders/OrderFilters';
import AdminTable from '../components/common/AdminTable';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import Pagination from '../components/common/Pagination';
import OrderDetailDrawer from '../components/orders/OrderDetailDrawer';
import { supabase } from '../../supabaseClient';

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

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
  }, [currentPage, statusFilter, paymentFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        payment: paymentFilter,
        search: searchTerm,
      });

      let fetchedOrders = null;
      try {
        const res = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          fetchedOrders = data.orders;
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || data.orders?.length || 0);
        }
      } catch (apiErr) {
        console.warn('API fetchOrders failed, falling back to direct Supabase fetch:', apiErr);
      }

      if (Array.isArray(fetchedOrders) && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      } else {
        // Direct Supabase query
        let query = supabase.from('orders').select('*', { count: 'exact' });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (paymentFilter !== 'all') query = query.eq('payment_type', paymentFilter);
        
        const { data: dbOrders, count } = await query.order('created_at', { ascending: false });
        let allOrders = dbOrders || [];

        // Combine with any locally placed purchases in localStorage
        const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        if (localSaved.length > 0) {
          const existingIds = new Set(allOrders.map(o => o.id));
          const newLocals = localSaved.filter(o => !existingIds.has(o.id));
          allOrders = [...newLocals, ...allOrders];
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

  const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Payment', 'Status', 'Total', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Orders Registry</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Manage customer transactions & deliveries</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all self-start cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter panel */}
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
      />

      {/* Orders Table */}
      <AdminTable headers={headers} isLoading={loading} emptyMessage="No orders match search filters">
        {orders.map((order) => (
          <tr 
            key={order.id} 
            className="hover:bg-slate-800/20 transition-colors cursor-pointer"
            onClick={() => handleRowClick(order)}
          >
            <td className="px-6 py-4 font-bold text-indigo-400">
              #{order.id.slice(0, 8).toUpperCase()}
            </td>
            <td className="px-6 py-4 text-slate-400">
              {new Date(order.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 font-semibold text-white">
              {order.customer_name}
            </td>
            <td className="px-6 py-4">
              {order.phone}
            </td>
            <td className="px-6 py-4 uppercase font-bold text-[10px] text-slate-400">
              {order.payment_type}
            </td>
            <td className="px-6 py-4">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="px-6 py-4 font-extrabold text-white">
              ₹{order.total}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(order);
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-white transition-colors cursor-pointer"
              >
                Inspect
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

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
