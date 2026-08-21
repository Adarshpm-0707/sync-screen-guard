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
            <td className="px-6 py-3.5 font-bold text-indigo-400">
              #{order.id.slice(0, 8).toUpperCase()}
            </td>
            <td className="px-6 py-3.5">
              <div className="font-semibold text-white">{order.customer_name}</div>
              <div className="text-[10px] text-slate-500">{order.phone}</div>
            </td>
            <td className="px-6 py-3.5 uppercase font-bold text-[10px] text-slate-400">
              {order.payment_type}
            </td>
            <td className="px-6 py-3.5">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="px-6 py-3.5 font-extrabold text-white">
              ₹{order.total}
            </td>
            <td className="px-6 py-3.5">
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
