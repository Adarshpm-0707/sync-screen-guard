import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ArrowUpDown, ShieldCheck, Sparkles, 
  ChevronRight, Filter, Smartphone, X, Layers,
  Eye, Camera, Watch, LayoutGrid, ListFilter, ArrowRight
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts, getInstantProducts } from '../utils/productStore';
import { fetchCategories, getInstantCategories } from '../utils/categoryStore';
import { isProductMatch, isCategoryMatch, getProductSearchScore } from '../utils/searchHelper';
import ProductCard from '../components/product/ProductCard';
import ProductCarousel from '../components/product/ProductCarousel';

const CATEGORY_ICONS = {
  glass: ShieldCheck,
  privacy: Eye,
  sparkle: Sparkles,
  camera: Camera,
  watch: Watch
};

export default function ProductsPage() {
  const [products, setProducts] = useState(() => getInstantProducts());
  const [categoriesList, setCategoriesList] = useState(() => getInstantCategories());
  // Only show loading spinner if BOTH caches are empty (first-ever visit)
  const [loading, setLoading] = useState(
    () => getInstantProducts().length === 0 && getInstantCategories().length === 0
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [addedMap, setAddedMap] = useState({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [items, cats] = await Promise.all([
          fetchStoreProducts(),
          fetchCategories()
        ]);
        const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
        const validItems = (items || []).filter(p => p && p.id && !deletedIds.has(p.id));
        setProducts(validItems);
        setCategoriesList(cats || []);
      } catch (e) {
        console.error('Error loading products page data:', e);
      } finally {
        setLoading(false);
      }
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

  // Valid products excluding deleted
  const validProducts = useMemo(() => {
    const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
    return products.filter(p => p && p.id && !deletedIds.has(p.id));
  }, [products]);

  // Only admin-side added categories
  const activeCategories = useMemo(() => {
    return (categoriesList || []).filter(c => c && c.id);
  }, [categoriesList]);

  // Category filter tabs with real live counts
  const filterTabs = useMemo(() => {
    const tabs = [
      { id: 'all', name: 'All Products', count: validProducts.length }
    ];

    activeCategories.forEach(c => {
      const count = validProducts.filter(p => isCategoryMatch(p, c.id, c.name)).length;
      tabs.push({
        id: c.id,
        name: c.name,
        count
      });
    });

    return tabs;
  }, [activeCategories, validProducts]);

  const activeCategoryObj = useMemo(() => {
    return activeCategories.find(c => c.id.toLowerCase() === categoryFilter.toLowerCase());
  }, [activeCategories, categoryFilter]);

  // Filtered products list
  const processedProducts = useMemo(() => {
    let result = validProducts;

    // 1. Category Filter: if specific category is selected, filter by it
    if (categoryFilter !== 'all') {
      const catName = activeCategoryObj?.name || categoryFilter;
      result = result.filter(p => isCategoryMatch(p, categoryFilter, catName));
    }

    // 2. Search Query Filter (Matches title, description, category, and related keywords)
    if (searchQuery.trim()) {
      result = result.filter(p => isProductMatch(p, searchQuery));
      // Sort by search relevance score first if no explicit price sort
      if (sortBy === 'featured') {
        result = [...result].sort((a, b) => {
          return getProductSearchScore(b, searchQuery) - getProductSearchScore(a, searchQuery);
        });
      }
    }

    // 3. Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [validProducts, searchQuery, categoryFilter, activeCategoryObj, sortBy]);

  // Categorized sections for overview — shows ALL categories including empty ones
  const categorizedSections = useMemo(() => {
    const catMap = {};

    activeCategories.forEach(cat => {
      catMap[cat.id.toLowerCase()] = {
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        items: []
      };
    });

    const unassigned = [];

    validProducts.forEach(p => {
      if (searchQuery.trim() && !isProductMatch(p, searchQuery)) {
        return;
      }

      let matched = false;
      for (const cat of activeCategories) {
        if (isCategoryMatch(p, cat.id, cat.name)) {
          catMap[cat.id.toLowerCase()]?.items.push(p);
          matched = true;
          break;
        }
      }

      if (!matched) {
        unassigned.push(p);
      }
    });

    const sections = [];

    // Include ALL categories — even empty ones — so newly added categories always appear
    activeCategories.forEach(cat => {
      const g = catMap[cat.id.toLowerCase()];
      if (g) {
        if (sortBy === 'price-low') {
          g.items.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price-high') {
          g.items.sort((a, b) => Number(b.price) - Number(a.price));
        }
        sections.push(g);
      }
    });

    if (unassigned.length > 0) {
      if (sortBy === 'price-low') {
        unassigned.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortBy === 'price-high') {
        unassigned.sort((a, b) => Number(b.price) - Number(a.price));
      }
      sections.push({
        id: 'more',
        name: 'Electronics & Accessories',
        description: 'All verified Sync gadgets and essentials',
        items: unassigned
      });
    }

    return sections;
  }, [validProducts, activeCategories, searchQuery, sortBy]);

  const handleAddToCart = useCallback((product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000);
  }, [addToCart]);

  const isAllViewWithoutSearch = categoryFilter === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 w-full">
      
      {/* ── 1. Page Header ── */}
      <div className="bg-white border-b border-zinc-200/80 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            <button onClick={() => navigate('/')} className="hover:text-zinc-900 transition-colors cursor-pointer">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900">
              {categoryFilter === 'all' ? 'All Products' : (activeCategoryObj?.name || 'Category')}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
                {categoryFilter === 'all' ? 'All Products Catalog' : `${activeCategoryObj?.name || 'Category'}`}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                {categoryFilter === 'all' 
                  ? `Showing all ${validProducts.length} verified Sync electronics and accessories.` 
                  : (activeCategoryObj?.description || `Browse our verified ${activeCategoryObj?.name || 'category'} products.`)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider bg-zinc-100 px-3.5 py-1.5 rounded-full">
                {loading ? 'Loading...' : `${processedProducts.length} ${processedProducts.length === 1 ? 'Product' : 'Products'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter & Search Toolbar ── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs py-2.5 sm:py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Category Filter Tabs with live counts */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCategoryFilter(tab.id);
                    setSearchParams(tab.id === 'all' ? {} : { category: tab.id });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    categoryFilter === tab.id
                      ? 'bg-zinc-900 text-white shadow-xs scale-[1.02]'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  <span>{tab.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    categoryFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {tab.count}
                  </span>
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
                  placeholder="Search model, title, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
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
      {!loading && products.length > 0 && categoryFilter === 'all' && !searchQuery.trim() && (
        <ProductCarousel products={products} />
      )}

      {/* ── 4. Main Products Display Area ── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {loading ? (
          /* Fast Skeleton Loaders */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-200 p-4 space-y-3 animate-pulse">
                <div className="aspect-square w-full rounded-2xl bg-zinc-100" />
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 rounded w-1/2" />
                <div className="pt-2 flex justify-between items-center border-t border-zinc-100">
                  <div className="h-5 bg-zinc-100 rounded w-16" />
                  <div className="h-8 bg-zinc-100 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : isAllViewWithoutSearch ? (
          /* ── Category-Wise Grouped Overview (All Products Shown) ── */
          <div className="space-y-12 sm:space-y-16">
            {categorizedSections.length > 0 ? (
              categorizedSections.map((section) => {
                const CatIcon = CATEGORY_ICONS[section.id.toLowerCase()] || ShieldCheck;

                return (
                  <section key={section.id} className="space-y-5">
                    
                    {/* Category Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                          <CatIcon className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                              {section.name}
                            </h2>
                            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full uppercase">
                              {section.items.length} {section.items.length === 1 ? 'Product' : 'Products'}
                            </span>
                          </div>
                          {section.description && (
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCategoryFilter(section.id);
                          setSearchParams({ category: section.id });
                        }}
                        className="text-xs font-bold text-zinc-900 hover:text-emerald-600 inline-flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <span>Filter Only {section.name}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Category Products Grid */}
                    {section.items.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
                        {section.items.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            onAddToCart={handleAddToCart}
                            isAdded={!!addedMap[p.id]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-zinc-300 rounded-2xl py-8 px-4 text-center">
                        <Sparkles className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coming Soon</p>
                        <p className="text-[11px] text-zinc-400 mt-1">New {section.name} products are on their way!</p>
                      </div>
                    )}

                  </section>
                );
              })
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-3 sm:space-y-4 my-8 shadow-xs">
                <ShieldCheck className="h-8 w-8 text-zinc-400 mx-auto" />
                <h3 className="font-display text-base sm:text-lg font-bold text-zinc-900 uppercase">
                  No products available
                </h3>
              </div>
            )}
          </div>
        ) : processedProducts.length > 0 ? (
          /* ── Category Filtered View / Search Results View ── */
          <div className="space-y-6">
            
            {/* Filter status banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-100/90 border border-zinc-200 rounded-2xl p-3.5 sm:px-5 sm:py-3 gap-2 text-xs shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-zinc-700">
                  Showing {processedProducts.length} {processedProducts.length === 1 ? 'product' : 'products'} for:
                </span>
                {categoryFilter !== 'all' && (
                  <span className="font-extrabold uppercase bg-zinc-900 text-white px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider">
                    {activeCategoryObj?.name || categoryFilter}
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px]">
                    🔍 "{searchQuery}"
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-xs font-bold text-zinc-900 hover:text-emerald-600 underline uppercase tracking-wider cursor-pointer self-start sm:self-auto"
              >
                Show All Products
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
              {processedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  isAdded={!!addedMap[p.id]}
                />
              ))}
            </div>

          </div>
        ) : (
          /* Empty State — shown when search/filter finds no products */
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-3 sm:space-y-4 my-8 shadow-xs">
            <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="font-display text-base sm:text-xl font-black text-zinc-900 uppercase tracking-tight">
              {searchQuery.trim()
                ? `"${searchQuery}" is not in our store`
                : 'No Products Found'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              {searchQuery.trim()
                ? `We don't currently carry products for "${searchQuery}". Check back soon or browse our full catalog below.`
                : 'No products match your current filter. Try a different category or view all products.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setSearchParams({});
                }}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Browse All Products
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}