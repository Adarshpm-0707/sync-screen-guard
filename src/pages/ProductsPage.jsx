import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Star, ShieldCheck, Sparkles, ArrowRight, 
  Search, Check, Zap, Truck, ArrowUpDown, Layers,
  Compass, Cpu
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts, DEFAULT_PRODUCTS } from '../utils/productStore';
import ProductCard from '../components/product/ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};



export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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

  const filterTabs = useMemo(() => {
    return [
      { id: 'all', name: 'All Products' },
      { id: 'bestseller', name: '🔥 Best Sellers' },
      ...categoriesList.map(c => ({ id: c.id, name: c.name }))
    ];
  }, [categoriesList]);

  const processedProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (categoryFilter === 'bestseller') {
      result = result.filter(p => p.is_best_seller);
    } else if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, searchQuery, categoryFilter, sortBy]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  return (
    <div className="relative w-full min-h-screen bg-sky-100 text-sky-950 font-sans selection:bg-sky-300">
      
      {/* ── ATMOSPHERIC SKY BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-sky-400/20 blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] contrast-125" />
      </div>

      <motion.div 
        initial="hidden" animate="visible" variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32 space-y-16"
      >
        
        {/* Header: Cyber Minimalist */}
        <header className="space-y-6 text-center lg:text-left">
          <motion.div variants={cardVariants} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-sky-200/60 border border-sky-300 shadow-sm">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-700">Digital Armor Interface</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div variants={cardVariants} className="space-y-2">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none text-sky-900">
                The <span className="text-cyan-600 italic">Lab</span> Catalog
              </h1>
              <p className="text-lg font-bold text-sky-700 max-w-xl">
                Browse molecularly strengthened ions and blue-spectrum visual defense systems.
              </p>
            </motion.div>

            {/* Quick Stats in Header */}
            <motion.div variants={cardVariants} className="hidden lg:flex gap-10">
              <div>
                <p className="text-3xl font-black text-sky-900">100%</p>
                <p className="text-[10px] font-black uppercase text-sky-500 tracking-widest">Alignment</p>
              </div>
              <div>
                <p className="text-3xl font-black text-sky-900">0.03mm</p>
                <p className="text-[10px] font-black uppercase text-sky-500 tracking-widest">Precision</p>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Toolbar: Floating Glass Interface */}
        <motion.div variants={cardVariants} className="p-4 rounded-[32px] bg-sky-200/40 backdrop-blur-3xl border border-sky-300/50 shadow-2xl shadow-sky-400/20 flex flex-col xl:flex-row items-center gap-6">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600" />
            <input 
              type="text" placeholder="Scan Catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sky-300/20 border border-sky-400/30 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-sky-900 placeholder-sky-500/60 focus:outline-none focus:ring-2 ring-sky-400/20"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto w-full no-scrollbar pb-2 xl:pb-0">
            {filterTabs.map((tab) => (
              <button 
                key={tab.id} onClick={() => setCategoryFilter(tab.id)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  categoryFilter === tab.id 
                    ? (tab.id === 'bestseller' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40' : 'bg-sky-600 text-sky-50 shadow-lg shadow-sky-400/40') 
                    : 'bg-sky-300/20 text-sky-600 border border-sky-400/20 hover:bg-sky-300/40'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto ml-auto">
            <ArrowUpDown className="w-4 h-4 text-sky-600" />
            <select 
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-sky-300/20 border border-sky-400/30 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-sky-800 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price Low</option>
              <option value="price-high">Price High</option>
            </select>
          </div>
        </motion.div>

        {/* Product Grid - 2 columns on mobile, 3/4 columns on laptop */}
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 items-stretch">
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
          <div className="bg-sky-200/40 border border-sky-300/50 rounded-[40px] p-16 text-center max-w-xl mx-auto space-y-4 my-12">
            <div className="w-14 h-14 rounded-3xl bg-sky-300/40 text-sky-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-sky-950 uppercase tracking-tight">No Products Added Yet</h3>
            <p className="text-xs text-sky-700 font-bold uppercase tracking-wider leading-relaxed">
              Only admin-added products are shown in the catalog. Log in to the Admin Panel to add new products.
            </p>
            <button
              onClick={() => navigate('/admin/products')}
              className="px-8 py-4 bg-sky-900 text-sky-50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-800 transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              Add Product in Admin Panel
            </button>
          </div>
        )}

        {/* Trust Interface: Horizontal Glass Bar */}
        <section className="p-8 sm:p-12 rounded-[50px] bg-sky-900 border border-sky-500/30 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-3xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] mb-1">Global Hub</p>
              <p className="text-xs font-bold text-sky-400">Next-day aerial delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-3xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] mb-1">Ion-Barrier</p>
              <p className="text-xs font-bold text-sky-400">30-day structural guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-3xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] mb-1">EZ-Install</p>
              <p className="text-xs font-bold text-sky-400">10s auto-align sequence</p>
            </div>
          </div>
        </section>

      </motion.div>
    </div>
  );
}