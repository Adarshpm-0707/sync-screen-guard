import React from 'react';
import AdminTable from '../common/AdminTable';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentOrdersTable({ orders = [], isLoading = false, onViewDetail }) {
  const headers = ['Order ID', 'Customer', 'Payment', 'Status', 'Total', 'Action'];

  return (
    <div className="space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            Recent Orders
          </h3>
        </div>
        <Link
          to="/admin/orders"
          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
        >
          <span>All Orders</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <AdminTable headers={headers} isLoading={isLoading} emptyMessage="No recent orders recorded">
        {orders.map((order) => {
          const isGuest = order.is_guest || !order.user_id;

          return (
            <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="px-4 py-3.5 font-bold font-mono text-indigo-400 whitespace-nowrap">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="font-bold text-white max-w-[140px] truncate text-xs">
                  {order.customer_name || 'Customer'}
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">{order.phone}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded border ${
                    isGuest
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isGuest ? 'Guest' : 'Account'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-slate-300 tracking-wider">
                  {order.payment_type || 'COD'}
                </span>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3.5 font-black text-white whitespace-nowrap text-xs">
                ₹{Number(order.total || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <button
                  onClick={() => onViewDetail(order)}
                  className="px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  View
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
