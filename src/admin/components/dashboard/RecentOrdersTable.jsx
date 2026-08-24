import React from 'react';
import AdminTable from '../common/AdminTable';
import OrderStatusBadge from '../orders/OrderStatusBadge';

export default function RecentOrdersTable({ orders = [], isLoading = false, onViewDetail }) {
  const headers = ['Order ID', 'Customer', 'Payment', 'Status', 'Total', 'Actions'];

  return (
    <div className="space-y-3.5 text-left">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
        Recent Orders
      </h3>

      <AdminTable headers={headers} isLoading={isLoading} emptyMessage="No recent orders found">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
            <td className="px-3 sm:px-6 py-3.5 font-bold text-indigo-400 whitespace-nowrap">
              #{order.id.slice(0, 8).toUpperCase()}
            </td>
            <td className="px-3 sm:px-6 py-3.5 whitespace-nowrap">
              <div className="font-semibold text-white max-w-[120px] sm:max-w-xs truncate">{order.customer_name}</div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] text-slate-500">{order.phone}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded border ${
                  order.is_guest || !order.user_id
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {order.is_guest || !order.user_id ? 'Guest' : 'Account'}
                </span>
              </div>
            </td>
            <td className="px-3 sm:px-6 py-3.5 uppercase font-bold text-[10px] text-slate-400 whitespace-nowrap">
              {order.payment_type}
            </td>
            <td className="px-3 sm:px-6 py-3.5 whitespace-nowrap">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="px-3 sm:px-6 py-3.5 font-extrabold text-white whitespace-nowrap">
              ₹{order.total}
            </td>
            <td className="px-3 sm:px-6 py-3.5 whitespace-nowrap">
              <button
                onClick={() => onViewDetail(order)}
                className="text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-white transition-colors cursor-pointer"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
