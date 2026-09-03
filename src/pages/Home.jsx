import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, ChevronRight, ChevronDown, Star, ShieldCheck } from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts, getInstantProducts } from '../utils/productStore';
import { fetchGroupedModels, getInstantGroupedModels } from '../utils/deviceModelStore';
import { extractModelNumber } from '../utils/searchHelper';
import ProductCard from '../components/product/ProductCard';
import heroBgImage from '../assets/hero-bg.png';
import mobileHeroBgImage from '../assets/hero-bg-mobile.png';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState(() => getInstantProducts());
  const [loading, setLoading] = useState(() => getInstantProducts().length === 0);
  const [addedMap, setAddedMap] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  // Quick Device Finder state - loaded from admin device models store
  const [deviceModelsByBrand, setDeviceModelsByBrand] = useState(() => getInstantGroupedModels());
  const [selectedBrand, setSelectedBrand] = useState(() => {
    const brands = Object.keys(getInstantGroupedModels());
    return brands[0] || 'iPhone';
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    const grouped = getInstantGroupedModels();
    const brands = Object.keys(grouped);
    const firstBrand = brands[0] || 'iPhone';
    return grouped[firstBrand]?.[0] || '';
  });

  useEffect(() => {
    async function loadCatalog() {
      try {
        const storeItems = await fetchStoreProducts();
        const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
        const validItems = (storeItems || []).filter(p => p && p.id && !deletedIds.has(p.id));
        setProducts(validItems);
      } catch (err) {
        console.error('Error loading home catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadBrandsAndModels() {
      try {
        const grouped = await fetchGroupedModels();
        if (grouped && Object.keys(grouped).length > 0) {
          setDeviceModelsByBrand(grouped);
        }
      } catch (err) {
        console.error('Error loading device models:', err);
      }
    }

    loadCatalog();
    loadBrandsAndModels();

    window.addEventListener('products_updated', loadCatalog);
    window.addEventListener('device_models_updated', loadBrandsAndModels);
    window.addEventListener('storage', () => {
      loadCatalog();
      loadBrandsAndModels();
    });

    return () => {
      window.removeEventListener('products_updated', loadCatalog);
      window.removeEventListener('device_models_updated', loadBrandsAndModels);
      window.removeEventListener('storage', loadCatalog);
    };
  }, []);

  // Keep dropdown selection valid when admin brands or models change
  useEffect(() => {
    const brands = Object.keys(deviceModelsByBrand);
    if (brands.length > 0) {
      if (!deviceModelsByBrand[selectedBrand]) {
        const firstBrand = brands[0];
        setSelectedBrand(firstBrand);
        setSelectedModel(deviceModelsByBrand[firstBrand]?.[0] || '');
      } else if (!deviceModelsByBrand[selectedBrand]?.includes(selectedModel)) {
        setSelectedModel(deviceModelsByBrand[selectedBrand]?.[0] || '');
      }
    }
  }, [deviceModelsByBrand, selectedBrand, selectedModel]);

  const handleAddToCart = useCallback((prod, e) => {
    if (e) e.stopPropagation();
    addToCart(prod, 1);
    setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 2000);
  }, [addToCart]);

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab || (activeTab === 'bestseller' && p.is_best_seller));

  const handleDeviceFinderSearch = () => {
    if (selectedModel) {
      navigate(`/products?search=${encodeURIComponent(selectedModel.trim())}`);
    } else if (selectedBrand) {
      navigate(`/products?search=${encodeURIComponent(selectedBrand.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const scrollToFinder = () => {
    const el = document.getElementById('device-finder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const availableBrands = Object.keys(deviceModelsByBrand);

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-hidden bg-[#FAFAFA]">
      
      {/* ── 1. Minimalist Cinema Hero Section ── */}
      <section 
        className="relative w-full bg-[#09090b] text-white overflow-hidden border-b border-zinc-800/80 min-h-[calc(100svh-64px)] md:min-h-[640px] lg:min-h-[720px] flex items-center justify-center"
      >
        {/* Desktop / Laptop Background Imagery */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Sync Electronics & Smart Gadgets"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/hero-bg.png';
            }}
            className="w-full h-full object-cover object-center lg:object-[center_right] select-none scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 lg:from-black/90 lg:via-black/60 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        </div>

        {/* Mobile Background Imagery */}
        <div className="md:hidden absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={mobileHeroBgImage}
            alt="Sync Electronics & Smart Gadgets"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/hero-bg-mobile.png';
            }}
            className="w-full h-full object-cover object-center select-none scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90" />
        </div>

        {/* Hero Content Stage */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-h-[calc(100svh-64px)] md:min-h-0 flex flex-col justify-between md:justify-center py-6 sm:py-20 lg:py-32">
          
          {/* Top Section / Title */}
          <div className="max-w-2xl text-left pt-2 sm:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sync Official Brand
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] uppercase text-left">
                Next-Gen Tech. <br />
                <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                  Smart Innovation.
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Bottom Section / Actions */}
          <div className="max-w-2xl text-left space-y-3.5 pt-6 md:pt-8 pb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 w-full"
            >
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-white px-7 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={scrollToFinder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/80 px-6 py-3 sm:px-7 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:text-white transition-all backdrop-blur-md active:scale-95 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Find By Device</span>
              </button>
            </motion.div>
          </div>

        </div>

      </section>

      {/* ── Lower Content Sections ── */}
      <div className="space-y-10 sm:space-y-16 mt-6 sm:mt-14 w-full">

        {/* ── 2. Featured Bestsellers & Products Grid ── */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-8 gap-2 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500 mb-0.5">
                <Star className="h-3 w-3 fill-amber-500" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-display text-lg sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                Trending Bestsellers
              </h2>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
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
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
              {filteredProducts.slice(0, 12).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAdded={!!addedMap[product.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 bg-white rounded-2xl border border-zinc-200">
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase">No products currently available</p>
            </div>
          )}

          <div className="text-center mt-6 sm:mt-10">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-2xl sm:rounded-full transition-colors border border-zinc-900 shadow-md active:scale-95"
            >
              <span>View Complete Catalog ({products.length} Products)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── 3. Quick Device Compatibility Finder (Admin Configured Models Only) ── */}
        {availableBrands.length > 0 && (
          <section id="device-finder-section" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 w-full">
            <div className="rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 p-4 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
                
                <div className="space-y-1 max-w-md">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Instant Compatibility Finder</span>
                  </div>
                  <h3 className="font-display text-base sm:text-2xl font-black uppercase tracking-tight text-white">
                    Find Compatible Products For Your Device
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400">Select your smartphone brand and exact model to instantly see matching products in our store.</p>
                </div>

                {/* Selectors */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  
                  {/* Brand Selector */}
                  <div className="space-y-1 flex-1 sm:flex-initial">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        const newB = e.target.value;
                        setSelectedBrand(newB);
                        setSelectedModel(deviceModelsByBrand[newB]?.[0] || '');
                      }}
                      className="w-full sm:w-44 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2.5 sm:px-3.5 sm:py-2.5 text-xs font-bold text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      {availableBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selector */}
                  <div className="space-y-1 flex-1 sm:flex-initial">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Exact Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full sm:w-56 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2.5 sm:px-3.5 sm:py-2.5 text-xs font-bold text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      {(deviceModelsByBrand[selectedBrand] || []).map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:self-end pt-1 sm:pt-0">
                      <button
                      onClick={handleDeviceFinderSearch}
                      className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <span>Find Products</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
