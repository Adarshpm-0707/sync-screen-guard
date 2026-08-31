import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function TrackingLink({ awb, trackingUrl }) {
  if (!awb) return <span className="text-slate-500 font-semibold text-xs">—</span>;

  const destination = trackingUrl || `https://shiprocket.co/tracking/${awb}`;

  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-all duration-200 text-[10px] font-black uppercase tracking-wider group cursor-pointer shadow-sm"
    >
      <span>Live Track</span>
      <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}
