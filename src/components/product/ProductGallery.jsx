import React, { useState } from 'react';

export default function ProductGallery({ images = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Fallback images if none provided
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600'
  ];

  return (
    <div className="flex flex-col space-y-5">
      {/* Main Display Image - Floating 3D Card */}
      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center justify-center p-8 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
        
        <img
          src={displayImages[activeIdx]}
          alt="Product showcase"
          className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-108 drop-shadow-2xl"
        />
      </div>

      {/* Thumbnail Nav Indicators */}
      <div className="flex space-x-3.5">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-white/60 backdrop-blur-xl p-1.5 transition-all duration-300 ${
              activeIdx === idx
                ? 'border-primary-600 shadow-xl shadow-primary-500/20 scale-105 ring-4 ring-primary-500/20'
                : 'border-black/10 hover:border-black/30 hover:scale-98'
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain rounded-xl" />
          </button>
        ))}
      </div>
    </div>
  );
}
