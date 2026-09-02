import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchStoreProducts } from '../../utils/productStore';

const POPULAR_SEARCHES = [
  'iPhone 15 Pro Max',
  'Privacy Glass',
  'Samsung S24 Ultra',
  'Matte Anti-Glare',
  'Camera Lens Protector',
  'OnePlus 12'
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchStoreProducts().then((items) => setProducts(items || []));
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setFilteredResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
    setFilteredResults(results.slice(0, 6));
  }, [query, products]);

  const handleSelectProduct = (product) => {
    onClose();
    navigate('/product', { state: { product } });
  };

  const handlePopularClick = (term) => {
    setQuery(term);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200"
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-zinc-100 px-5 py-4">
              <Search className="h-5 w-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search screen protectors, privacy glass, models..."
                className="w-full bg-transparent px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-zinc-400 hover:text-zinc-600 mr-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Results or Popular Tags */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {query.trim() ? (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Search Results ({filteredResults.length})</span>
                  </div>

                  {filteredResults.length === 0 ? (
                    <div className="py-10 text-center text-zinc-500 text-xs">
                      <p className="font-semibold">No screen protectors found for "{query}"</p>
                      <p className="text-zinc-400 mt-1">Try searching for "iPhone", "Privacy", or "Samsung"</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer group"
                        >
                          <div className="h-14 w-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/50 p-1">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 truncate group-hover:text-zinc-900">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-zinc-900">
                                ₹{product.price}
                              </span>
                              {product.original_price && Number(product.original_price) > Number(product.price) && (
                                <span className="text-[10px] text-zinc-400 line-through">
                                  ₹{product.original_price}
                                </span>
                              )}
                              <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                9H Tempered
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                      <TrendingUp className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => handlePopularClick(term)}
                          className="rounded-full bg-zinc-100 hover:bg-zinc-200/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100">
                    <p className="text-[11px] font-medium text-zinc-400">
                      💡 Pro-Tip: All Sync Screen Protectors include our 10-second auto-align installation box applicator!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
