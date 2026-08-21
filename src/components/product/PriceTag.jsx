import React from 'react';

export default function PriceTag({ price, originalPrice, className = '' }) {
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={`flex items-baseline space-x-2 ${className}`}>
      <span className="font-display text-2xl font-bold text-white">
        ₹{price}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className="text-sm text-slate-500 line-through">
            ₹{originalPrice}
          </span>
          <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-500">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
