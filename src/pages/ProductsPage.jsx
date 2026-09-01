import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowUpDown, ShieldCheck, Sparkles, 
  ChevronRight, Filter, Smartphone, X 
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts, getInstantProducts } from '../utils/productStore';
import { fetchCategories } from '../utils/categoryStore';
import ProductCard from '../components/product/ProductCard';
import ProductCarousel from '../components/product/ProductCarousel';

export default function ProductsPage() {
  const [products, setProducts] = useState(() => getInstantProducts());
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [addedMap, setAddedMap] = useState({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const [items, cats] = await Promise.all([
        fetchStoreProducts(),
        fetchCategories()
      ]);
      setProducts(items || []);
      setCategoriesList(cats || []);
    }
    loadData();

    window.addEventListener('products_updated', loadData);
    window.addEventListener('categories_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('products_updated', loadData);
      window.removeEventListener('categories_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // Update query from URL parameters if changed
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategoryFilter(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filterTabs = useMemo(() => {
    return [
      { id: 'all', name: 'All Products' },
      ...categoriesList.map(c => ({ id: c.id, name: c.name }))
    ];
  }, [categoriesList]);

  const processedProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => (p.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return result;
  }, [products, searchQuery, categoryFilter, sortBy]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 w-full">
      
      {/* ── 1. Page Header ── */}
      <div className="bg-white border-b border-zinc-200/80 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            <button onClick={() => navigate('/')} className="hover:text-zinc-900 transition-colors">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900">All Products</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
                Screen Protection Catalog
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                Precision-cut 9H tempered glass, anti-spy privacy armor, and silk matte protectors.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider bg-zinc-100 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
              {processedProducts.length} {processedProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Filter & Search Toolbar ── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs py-2.5 sm:py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCategoryFilter(tab.id);
                    setSearchParams({ category: tab.id });
                  }}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    categoryFilter === tab.id
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Right: Search & Sort */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter by device / model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-bold text-zinc-800 uppercase tracking-wider focus:border-zinc-900 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── 3. Interactive Animated Carousel Showcase ── */}
      {products.length > 0 && (
        <ProductCarousel products={products} />
      )}

      {/* ── 4. Product Grid - Single Card on Mobile, Multi-col on Tablet & Desktop ── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
            <AnimatePresence mode="popLayout">
              {processedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  isAdded={!!addedMap[p.id]}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-3 sm:space-y-4 my-8 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-zinc-900 uppercase">
              No matching products found
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We couldn't find any screen protectors matching your current filter. Try resetting your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setSearchParams({});
              }}
              className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}