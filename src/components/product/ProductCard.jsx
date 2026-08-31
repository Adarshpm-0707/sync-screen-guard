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
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-zinc-200/80 p-2.5 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-zinc-300 cursor-pointer h-full"
    >
      <div>
        {/* ── 1. Image Container with Badges ── */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-100 mb-2.5 sm:mb-3.5 flex items-center justify-center p-1.5 sm:p-2">
          {/* Main Product Image */}
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.is_best_seller && (
              <span className="rounded bg-zinc-900 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                BESTSELLER
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded bg-emerald-600 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Tray Included Pill (Desktop Hover) */}
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-center border border-zinc-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
            <span className="text-[10px] font-bold text-zinc-800 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Auto-Align Box Included
            </span>
          </div>
        </div>

        {/* ── 2. Product Information ── */}
        <div className="space-y-1 sm:space-y-1.5 px-0.5">
          {/* Category / Subtitle */}
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate">
            {product.category === 'privacy' ? 'Privacy Armor' : product.category === 'matte' ? 'Matte Finish' : '9H Tempered Glass'}
          </p>

          {/* Title */}
          <h3 className="font-display text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-zinc-700 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating stars */}
          <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-zinc-800">4.9</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">(180+)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-1 flex-wrap">
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-zinc-900">
              ₹{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-medium">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Action Buttons ── */}
      <div className="mt-3 pt-2 border-t border-zinc-100">
        <button
          onClick={handleAddClick}
          className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-98'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
