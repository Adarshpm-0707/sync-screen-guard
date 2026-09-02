import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, EyeOff, Sparkles, Camera, Watch, 
  Layers, ArrowRight, Star, ChevronRight, Tag 
} from 'lucide-react';

const CATEGORY_ICONS = {
  glass: Shield,
  privacy: EyeOff,
  sparkle: Sparkles,
  matte: Sparkles,
  camera: Camera,
  watch: Watch,
};

export default function ProductsMegaMenu({ 
  isOpen, 
  onClose, 
  categories = [], 
  products = [] 
}) {
  const navigate = useNavigate();
  const [hoveredCategoryId, setHoveredCategoryId] = useState(() => {
    return categories[0]?.id || 'glass';
  });

  // Keep a valid category selected
  const activeCategoryId = useMemo(() => {
    if (categories.some(c => c.id === hoveredCategoryId)) {
      return hoveredCategoryId;
    }
    return categories[0]?.id || 'glass';
  }, [categories, hoveredCategoryId]);

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId) || categories[0] || { id: 'glass', name: 'Glass Guard' };
  }, [categories, activeCategoryId]);

  // Filter products for the active category
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const catId = (activeCategoryId || '').toLowerCase();
    
    const matched = products.filter(p => {
      const pCat = (p.category || 'glass').toLowerCase();
      if (pCat === catId) return true;
      if (catId === 'sparkle' && pCat === 'matte') return true;
      if (catId === 'matte' && pCat === 'sparkle') return true;
      // Also match by product title / description keywords if category is specific
      const fullText = `${p.name || ''} ${p.description || ''}`.toLowerCase();
      if (catId === 'camera' && fullText.includes('camera')) return true;
      if (catId === 'watch' && (fullText.includes('watch') || fullText.includes('iwatch'))) return true;
      if (catId === 'privacy' && fullText.includes('privacy')) return true;
      return false;
    });

    if (matched.length > 0) return matched;

    // If no direct matches, return general products
    return products.slice(0, 6);
  }, [products, activeCategoryId]);

  const handleProductClick = (product) => {
    onClose();
    navigate('/product', { state: { product } });
  };

  const handleViewAllCategory = (catId) => {
    onClose();
    navigate(`/products?category=${encodeURIComponent(catId)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[780px] lg:w-[940px] max-w-[95vw] rounded-3xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl p-4 sm:p-5 text-left text-white overflow-hidden"
          onMouseEnter={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-12 gap-4 lg:gap-6 items-stretch">
            
            {/* ── Left Column: Categories List (4 Cols) ── */}
            <div className="col-span-4 border-r border-zinc-800/80 pr-3 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between px-3 py-1 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Product Categories
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    {categories.length} Categories
                  </span>
                </div>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isSelected = cat.id === activeCategoryId;
                    const IconComponent = CATEGORY_ICONS[cat.id] || Layers;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseEnter={() => setHoveredCategoryId(cat.id)}
                        onClick={() => handleViewAllCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-150 cursor-pointer group text-left ${
                          isSelected
                            ? 'bg-zinc-800/90 border border-emerald-500/40 text-white shadow-md'
                            : 'hover:bg-zinc-900/80 border border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-emerald-500 text-black shadow-xs font-bold' 
                              : 'bg-zinc-900 text-zinc-400 group-hover:text-white border border-zinc-800'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                              {cat.description || 'Premium Protection'}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Entire Catalog Link */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80">
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>All Protectors ({products.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* ── Right Column: Dynamic Category Products Showcase (8 Cols) ── */}
            <div className="col-span-8 flex flex-col justify-between pl-1">
              <div>
                {/* Active Category Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <span>{activeCategory.name}</span>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {filteredProducts.length} Items
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                      {activeCategory.description || 'Precision engineered 9H tempered glass screen protectors'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewAllCategory(activeCategoryId)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
                  >
                    <span>View Category</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Products Grid for hovered category */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {filteredProducts.slice(0, 6).map((product) => {
                    const price = Number(product.price) || 640;
                    const originalPrice = Number(product.original_price) || Math.round(price * 1.8);
                    const image = product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=300';

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group flex flex-col justify-between p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer text-left shadow-sm hover:shadow-lg"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative aspect-4/3 w-full rounded-xl bg-zinc-950/80 flex items-center justify-center p-2 mb-2 overflow-hidden border border-zinc-800/60 group-hover:border-zinc-700">
                            {product.is_best_seller && (
                              <span className="absolute top-1.5 left-1.5 z-10 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Bestseller
                              </span>
                            )}
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          </div>

                          {/* Product Title */}
                          <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white line-clamp-1 leading-snug">
                            {product.name}
                          </h4>

                          {/* Product Short Description */}
                          {product.description && (
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800/70">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-black text-white">
                              ₹{price.toLocaleString()}
                            </span>
                            {originalPrice > price && (
                              <span className="text-[9px] text-zinc-500 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            <span>Details</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Feature Strip */}
              <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span>10-Second Auto Alignment Box Applicator Included</span>
                </span>
                <span className="text-zinc-500 hidden sm:inline">
                  Free Express Shipping on orders above ₹499
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
