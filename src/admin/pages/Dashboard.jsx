import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Hourglass, 
  IndianRupee, 
  RefreshCw, 
  CreditCard, 
  Box, 
  Warehouse, 
  Truck, 
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
      console.warn('API fetchDashboardData fallback:', err);
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
          const dateString = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

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
        setRecentOrders(allOrders.slice(0, 8));
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
    fetchDashboardData();
  };

  const totalPayments = (stats.prepaidCount || 0) + (stats.codCount || 0);
  const prepaidPct = totalPayments > 0 ? Math.round((stats.prepaidCount / totalPayments) * 100) : 0;
  const codPct = totalPayments > 0 ? 100 - prepaidPct : 0;

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* Top Banner & Control Box */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Operational Dashboard
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Store health metrics, revenue velocity & recent transaction log
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all self-start sm:self-center cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync Live Metrics</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Orders"
          value={loading ? '...' : stats.totalOrders.toLocaleString()}
          description="Lifetime registered purchases"
          icon={ShoppingBag}
          gradient="from-indigo-600 to-blue-600"
          badgeText="All Time"
        />
        <StatCard
          title="Pending Fulfillment"
          value={loading ? '...' : stats.pendingOrders.toLocaleString()}
          description="Awaiting dispatch / verify"
          icon={Hourglass}
          gradient="from-amber-600 to-orange-500"
          trendColor="text-amber-400 font-extrabold"
          badgeText="Needs Action"
        />
        <StatCard
          title="Revenue Today"
          value={loading ? '...' : `₹${Number(stats.revenueToday).toLocaleString()}`}
          description="Transactions closed today"
          icon={IndianRupee}
          gradient="from-emerald-600 to-teal-500"
          trendColor="text-emerald-400 font-extrabold"
          badgeText="Today"
        />
        <StatCard
          title="Online vs COD"
          value={loading ? '...' : `${stats.prepaidCount} : ${stats.codCount}`}
          description={`${prepaidPct}% Prepaid • ${codPct}% COD`}
          icon={CreditCard}
          gradient="from-purple-600 to-pink-500"
          badgeText="Gateway Split"
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/admin/products"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group shadow-md"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 group-hover:scale-110 transition-transform">
              <Box className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-black text-white uppercase truncate">Products</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">Add & Edit</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/inventory"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group shadow-md"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <Warehouse className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-black text-white uppercase truncate">Inventory</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">Stock Monitor</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/orders"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group shadow-md"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-black text-white uppercase truncate">Orders</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">All Registry</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/shipments"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group shadow-md"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-black text-white uppercase truncate">Shipments</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">Courier Tracking</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
        </Link>
      </div>

      {/* Main Grid: Revenue Analytics + Payment Breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sales Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart data={salesHistory} />

          {/* Payment Split Visual Bar Card */}
          <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4.5 sm:p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Payment Channels Split
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {totalPayments} Orders Total
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-l-full transition-all duration-500" 
                style={{ width: `${prepaidPct || 50}%` }}
                title={`Prepaid Razorpay: ${prepaidPct}%`}
              />
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-r-full transition-all duration-500" 
                style={{ width: `${codPct || 50}%` }}
                title={`Cash on Delivery: ${codPct}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-md bg-indigo-500 shrink-0 shadow-sm shadow-indigo-500/50" />
                <div>
                  <span className="font-bold text-white block">Prepaid Razorpay</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{stats.prepaidCount} orders ({prepaidPct}%)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0 shadow-sm shadow-amber-500/50" />
                <div>
                  <span className="font-bold text-white block">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{stats.codCount} orders ({codPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Orders */}
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
          initialOrder={selectedOrder}
          onStatusUpdated={handleStatusUpdate}
        />
      )}
    </div>
  );
}
