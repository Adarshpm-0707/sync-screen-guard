import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function TrackingLink({ awb, trackingUrl }) {
  if (!awb) return <span className="text-slate-655 font-semibold">Not available</span>;

  // Fallback to standard Shiprocket tracking portal if explicit URL is missing
  const destination = trackingUrl || `https://shiprocket.co/tracking/${awb}`;

  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/20 text-indigo-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
    >
      <span>Track</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
