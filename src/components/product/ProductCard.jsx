import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap, Check } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProductCard({ product, onAddToCart, onBuyNow, isAdded }) {
  const navigate = useNavigate();

  if (!product) return null;

  const handleCardClick = () => {
    navigate('/product', { state: { product } });
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, e);
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product, e);
    } else {
      if (onAddToCart) onAddToCart(product, e);
      navigate('/checkout');
    }
  };

  const categoryLabel = product.category || 'Glass';
  const ratingValue = product.rating || 4.9;
  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600';
  const discountAmount = product.original_price && product.price && Number(product.original_price) > Number(product.price) ? Number(product.original_price) - Number(product.price) : null;
  const discountPercent = product.original_price && product.price && Number(product.original_price) > Number(product.price) ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100) : 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className="group relative flex flex-col h-full justify-between bg-sky-200/30 backdrop-blur-2xl border border-sky-300/60 rounded-3xl sm:rounded-[36px] p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-400/25 hover:border-sky-400/80 cursor-pointer overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-[26px] overflow-hidden bg-sky-300/20 border border-sky-300/40 shrink-0 mb-3 sm:mb-4">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Category Pill Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-sky-600/90 backdrop-blur-md text-sky-50 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
          {categoryLabel}
        </div>

        {/* 🔥 Best Seller Badge Overlay */}
        {product.is_best_seller && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
            <span>🔥 BEST SELLER</span>
          </div>
        )}

        {/* Discount Badge (% OFF) */}
        {discountPercent > 0 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-500 text-slate-950 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span>{discountPercent}% OFF</span>
          </div>
        )}
      </div>

      {/* Content Section - Flex Grow to balance card heights */}
      <div className="flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        {/* Title & Rating */}
        <div>
          <div className="flex items-start justify-between gap-1.5 mb-1 sm:mb-2">
            <h3 className="text-xs sm:text-lg font-black text-sky-950 tracking-tight uppercase leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] flex-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-0.5 sm:gap-1 bg-sky-400/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-sky-400/30 shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-sky-600 text-sky-600" />
              <span className="text-[9px] sm:text-xs font-black text-sky-800">{ratingValue}</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-[10px] sm:text-xs font-semibold text-sky-700/70 line-clamp-2 min-h-[1.5rem] sm:min-h-[2.25rem] leading-tight">
            {product.description || 'Molecularly micro-tempered ion glass with EZ Fit automatic alignment.'}
          </p>
        </div>

        {/* Price & Action Section at Bottom */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-sky-400/20 space-y-2 sm:space-y-3">
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[8px] sm:text-[9px] font-black text-sky-500 uppercase tracking-widest">Price</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm sm:text-2xl font-black text-sky-900 tracking-tighter">₹{product.price}</span>
                {product.original_price && (
                  <span className="text-[9px] sm:text-xs text-sky-600/50 line-through font-medium">₹{product.original_price}</span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[9px] sm:text-xs font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
            {product.stock && (
              <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In Stock
              </span>
            )}
          </div>

          {/* Buttons Row (Fits side-by-side cleanly in 2-column mobile & laptop) */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
            <button
              onClick={handleCartClick}
              className={`py-2 sm:py-3 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-sky-300/30 text-sky-900 border-sky-400/30 hover:bg-sky-300/50'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-sky-700" />
                  <span className="truncate">Add</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyClick}
              className="py-2 sm:py-3 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-wider transition-all bg-sky-600 text-sky-50 hover:bg-sky-700 shadow-md shadow-sky-500/25 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 fill-current" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

