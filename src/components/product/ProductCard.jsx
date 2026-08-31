import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Check, Sparkles } from 'lucide-react';

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
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white border border-zinc-200/80 p-2 sm:p-3 transition-all duration-300 hover:shadow-lg hover:border-zinc-300 cursor-pointer h-full"
    >
      <div>
        {/* ── 1. Compact Image Container with Badges ── */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-zinc-50 border border-zinc-100 mb-2 sm:mb-2.5 flex items-center justify-center p-1.5 sm:p-2.5">
          {/* Main Product Image */}
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full max-h-[115px] sm:max-h-[145px] object-contain rounded-md transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
            {product.is_best_seller && (
              <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                BESTSELLER
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* ── 2. Product Information ── */}
        <div className="space-y-0.5 sm:space-y-1 px-0.5">
          {/* Category / Subtitle */}
          <p className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-400 truncate">
            {product.category 
              ? product.category.replace(/[-_]/g, ' ') 
              : 'Screen Guard'}
          </p>

          {/* Title */}
          <h3 className="font-display text-[11px] sm:text-xs font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-zinc-700 transition-colors min-h-[1.75rem] sm:min-h-[2rem]">
            {product.name}
          </h3>

          {/* Rating stars */}
          <div className="flex items-center gap-1 pt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-800">4.9</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">(180+)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 pt-0.5 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-zinc-900">
              ₹{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="text-[9px] sm:text-[10px] text-zinc-400 line-through font-medium">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Action Buttons ── */}
      <div className="mt-2.5 pt-2 border-t border-zinc-100">
        <button
          onClick={handleAddClick}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-98'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3 w-3" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
