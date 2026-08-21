import React, { useEffect, useState } from 'react';
import { ShoppingBag, Hourglass, Landmark, RefreshCw } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import SalesChart from '../components/dashboard/SalesChart';
import OrderDetailDrawer from '../components/orders/OrderDetailDrawer';
import { supabase } from '../../supabaseClient';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenueToday: 0,
    codCount: 0,
    prepaidCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    let fetchedData = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchedData = await res.json();
      }
    } catch (err) {
      console.warn('API fetchDashboardData failed, calculating metrics via fallback:', err);
    }

    if (fetchedData && fetchedData.stats) {
      setStats(fetchedData.stats);
      setRecentOrders(fetchedData.recentOrders || []);
      setSalesHistory(fetchedData.salesHistory || []);
    } else {
      // Direct Supabase + local calculation fallback
      try {
        const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        let allOrders = dbOrders || [];

        const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        if (localSaved.length > 0) {
          const existingIds = new Set(allOrders.map(o => o.id));
          const newLocals = localSaved.filter(o => !existingIds.has(o.id));
          allOrders = [...newLocals, ...allOrders];
        }

        const totalOrdersVal = allOrders.length;
        const pendingOrdersVal = allOrders.filter(o => o.status === 'pending').length;
        const codCountVal = allOrders.filter(o => o.payment_type === 'cod').length;
        const prepaidCountVal = allOrders.filter(o => o.payment_type === 'razorpay').length;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const revenueTodayVal = allOrders
          .filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= startOfToday)
          .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        // Sales history past 7 days
        const salesHistoryArr = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateString = d.toLocaleDateString();

          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);

          const dayRevenue = allOrders
            .filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= start && new Date(o.created_at) <= end)
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

          salesHistoryArr.push({ date: dateString, revenue: dayRevenue });
        }

        setStats({
          totalOrders: totalOrdersVal,
          pendingOrders: pendingOrdersVal,
          revenueToday: revenueTodayVal,
          codCount: codCountVal,
          prepaidCount: prepaidCountVal
        });
        setRecentOrders(allOrders.slice(0, 10));
        setSalesHistory(salesHistoryArr);
      } catch (e) {
        console.error('Fallback dashboard calculation failed:', e);
      }
    }
    setLoading(false);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleStatusUpdate = () => {
    // Refresh stats after order updates
    fetchDashboardData();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Dashboard</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Overview of store health & operations</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all self-start cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Live Analytics</span>
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Orders"
          value={loading ? '...' : stats.totalOrders}
          description="Accumulated sales count"
          icon={ShoppingBag}
        />
        <StatCard
          title="Pending Orders"
          value={loading ? '...' : stats.pendingOrders}
          description="Needs packaging / confirm"
          icon={Hourglass}
          trendColor="text-amber-500"
        />
        <StatCard
          title="Revenue Today"
          value={loading ? '...' : `₹${stats.revenueToday}`}
          description="Sales generated today"
          icon={Landmark}
          trendColor="text-emerald-500"
        />
        <StatCard
          title="Payment Splits"
          value={loading ? '...' : `${stats.prepaidCount} : ${stats.codCount}`}
          description="PREPAID VS COD splitted"
          icon={Landmark}
        />
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={salesHistory} />
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1">
          <RecentOrdersTable 
            orders={recentOrders} 
            isLoading={loading} 
            onViewDetail={handleViewOrder} 
          />
        </div>
      </div>

      {/* Order Details Overlay Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          onStatusUpdated={handleStatusUpdate}
        />
      )}
    </div>
  );
}
