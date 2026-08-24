import React from 'react';
import AdminTable from '../common/AdminTable';
import ShipmentStatusBadge from './ShipmentStatusBadge';
import TrackingLink from './TrackingLink';

export default function ShipmentsTable({ shipments = [], isLoading = false }) {
  const headers = ['Order ID', 'Courier Partner', 'AWB Number', 'Status', 'ETA Date', 'Tracking Link'];

  return (
    <AdminTable headers={headers} isLoading={isLoading} emptyMessage="No active shipments logged">
      {shipments.map((shipment) => (
        <tr key={shipment.id} className="hover:bg-slate-800/10 transition-colors">
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-indigo-400 whitespace-nowrap">
            #{shipment.order_id?.slice(0, 8).toUpperCase() || '—'}
          </td>
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-semibold text-white whitespace-nowrap">
            {shipment.courier_name || 'Shiprocket'}
          </td>
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-400 font-mono whitespace-nowrap">
            {shipment.awb || 'Generating...'}
          </td>
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
            <ShipmentStatusBadge status={shipment.status} />
          </td>
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-400 whitespace-nowrap">
            {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'Pending info'}
          </td>
          <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
            <TrackingLink awb={shipment.awb} trackingUrl={shipment.tracking_url} />
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
