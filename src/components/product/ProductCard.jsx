import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Star } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isAdded }) {
  const navigate = useNavigate();

  if (!product) return null;

  const handleCardClick = () => {
    navigate('/product', { state: { product } });
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, e);
  };

  const price = Number(product.price) || 640;
  const originalPrice = Number(product.original_price) || Math.round(price * 1.8);
  const discountPercent = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600';

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between w-full h-full bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-4 sm:p-4 hover:border-zinc-400 hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer"
    >
      {/* ── TOP SECTION: Badges & Header ── */}
      <div>
        {/* Top bar: Badge & Rating */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {product.is_best_seller ? (
            <span className="bg-zinc-900 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
              Bestseller
            </span>
          ) : (
            <span />
          )}
          
          <div className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded-full ml-auto">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-zinc-700">4.9</span>
          </div>
        </div>

        {/* ── PRODUCT HERO IMAGE ── */}
        <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-zinc-50/80 group-hover:bg-zinc-100/60 transition-colors p-3 sm:p-4 flex items-center justify-center overflow-hidden mb-2.5 sm:mb-3">
          {/* Discount Pill in Corner */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight shadow-xs">
              {discountPercent}% OFF
            </div>
          )}

          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        </div>

        {/* ── PRODUCT TITLE & DESCRIPTION ── */}
        <div className="mb-2 space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] sm:text-xs text-zinc-500 font-normal leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* ── BOTTOM ACTION ISLAND (Price + Add Button) ── */}
      <div className="mt-auto pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
        {/* Price stack */}
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice > price && (
            <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-medium truncate">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Button: Pill button that never clips */}
        <button
          type="button"
          onClick={handleAddClick}
          aria-label={isAdded ? 'Added to bag' : 'Add to bag'}
          className={`inline-flex items-center justify-center gap-1 h-8 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shrink-0 shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}