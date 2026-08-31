import React from 'react';
import AdminTable from '../common/AdminTable';
import ShipmentStatusBadge from './ShipmentStatusBadge';
import TrackingLink from './TrackingLink';
import { Truck, Copy } from 'lucide-react';

export default function ShipmentsTable({ shipments = [], isLoading = false }) {
  const headers = ['Order ID', 'Courier Partner', 'AWB Number', 'Status', 'ETA Date', 'Live Action'];

  const copyAWB = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    alert(`AWB ${awb} copied to clipboard!`);
  };

  return (
    <AdminTable headers={headers} isLoading={isLoading} emptyMessage="No active shipments in transit">
      {shipments.map((shipment) => (
        <tr key={shipment.id} className="hover:bg-slate-800/30 transition-colors group">
          <td className="px-4 sm:px-5 py-4 font-black font-mono text-indigo-400 whitespace-nowrap">
            #{shipment.order_id?.slice(0, 8).toUpperCase() || '—'}
          </td>
          <td className="px-4 sm:px-5 py-4 font-bold text-white whitespace-nowrap text-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-slate-500" />
              <span>{shipment.courier_name || 'Shiprocket Express'}</span>
            </div>
          </td>
          <td className="px-4 sm:px-5 py-4 text-slate-300 font-mono text-xs whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>{shipment.awb || 'Pending carrier...'}</span>
              {shipment.awb && (
                <button
                  onClick={() => copyAWB(shipment.awb)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors"
                  title="Copy AWB"
                >
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          </td>
          <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
            <ShipmentStatusBadge status={shipment.status} />
          </td>
          <td className="px-4 sm:px-5 py-4 text-slate-400 whitespace-nowrap text-xs">
            {shipment.eta ? new Date(shipment.eta).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
          </td>
          <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
            <TrackingLink awb={shipment.awb} trackingUrl={shipment.tracking_url} />
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
