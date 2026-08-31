import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ProductGallery({ images = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600'
  ];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 w-full">
      {/* Thumbnails list (Horizontal on Mobile, Vertical on Desktop) */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 py-1 md:py-0 w-full md:w-20 lg:w-24">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all duration-200 cursor-pointer shrink-0 flex items-center justify-center ${
              activeIdx === idx
                ? 'border-zinc-900 shadow-sm ring-2 ring-zinc-900/10'
                : 'border-zinc-200 hover:border-zinc-400 opacity-75 hover:opacity-100'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="h-full w-full object-contain rounded-lg"
            />
          </button>
        ))}
      </div>

      {/* Main Image Showcase */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[520px] aspect-square rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/90 shadow-xs overflow-hidden flex items-center justify-center p-4 sm:p-8 group w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={displayImages[activeIdx]}
            alt="Product View"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full max-h-[280px] sm:max-h-[400px] md:max-h-[460px] object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
          />
        </AnimatePresence>

        {/* Feature Pill Overlay */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-full border border-zinc-200 shadow-xs flex items-center gap-1 z-10">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-800 uppercase tracking-wider">
            10s Auto-Align Tray
          </span>
        </div>
      </div>
    </div>
  );
}
