import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, ChevronRight, ChevronDown, Star, ShieldCheck } from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts, getInstantProducts } from '../utils/productStore';
import ProductCard from '../components/product/ProductCard';
import heroBgImage from '../assets/hero-bg.png';
import mobileHeroBgImage from '../assets/hero-bg-mobile.png';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState(() => getInstantProducts());
  const [addedMap, setAddedMap] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  // Quick Device Finder state
  const [selectedBrand, setSelectedBrand] = useState('iPhone');
  const [selectedModel, setSelectedModel] = useState('iPhone 16 Pro Max');

  useEffect(() => {
    async function loadCatalog() {
      const storeItems = await fetchStoreProducts();
      setProducts(storeItems || []);
    }
    loadCatalog();

    window.addEventListener('products_updated', loadCatalog);
    window.addEventListener('storage', loadCatalog);
    return () => {
      window.removeEventListener('products_updated', loadCatalog);
      window.removeEventListener('storage', loadCatalog);
    };
  }, []);

  // Dynamically derive available Brands & Models exclusively from admin-added products
  const deviceModelsByBrand = useMemo(() => {
    const brandMap = {};

    if (!products || products.length === 0) {
      return { 'iPhone': ['iPhone 16 Pro Max', 'iPhone 15 Pro Max', 'iPhone 14 Pro Max'] };
    }

    products.forEach((prod) => {
      const name = prod.name || '';
      const cat = (prod.category || '').toLowerCase();
      const desc = (prod.description || '').toLowerCase();
      const fullText = `${name} ${cat} ${desc}`;

      let brand = null;

      if (/iphone|apple/i.test(fullText)) {
        brand = 'iPhone';
      } else if (/samsung|galaxy/i.test(fullText)) {
        brand = 'Samsung';
      } else if (/oneplus|nord/i.test(fullText)) {
        brand = 'OnePlus';
      } else if (/pixel|google/i.test(fullText)) {
        brand = 'Google Pixel';
      } else if (/xiaomi|redmi|poco/i.test(fullText)) {
        brand = 'Xiaomi';
      } else if (/vivo|iqoo/i.test(fullText)) {
        brand = 'Vivo';
      } else if (/oppo/i.test(fullText)) {
        brand = 'Oppo';
      } else if (/realme/i.test(fullText)) {
        brand = 'Realme';
      } else if (/nothing/i.test(fullText)) {
        brand = 'Nothing';
      } else {
        if (prod.category && prod.category !== 'glass' && prod.category !== 'privacy' && prod.category !== 'matte') {
          brand = prod.category.charAt(0).toUpperCase() + prod.category.slice(1);
        } else {
          brand = 'iPhone';
        }
      }

      if (!brandMap[brand]) {
        brandMap[brand] = new Set();
      }

      // Extract specific models from product title
      if (brand === 'iPhone') {
        const iphoneMatches = name.match(/iPhone\s*(?:16|15|14|13|12|11|X|XR|XS|SE)?\s*(?:Pro\s*Max|Pro|Plus|Mini)?/gi);
        let found = false;
        if (iphoneMatches) {
          iphoneMatches.forEach(m => {
            const clean = m.trim();
            if (clean && clean.length >= 8) {
              brandMap[brand].add(clean);
              found = true;
            }
          });
        }
        if (!found) {
          const cleanTitle = name.replace(/^Sync\s+(?:EZ\s+Fit|Privacy\s+Armor|Matte\s+Anti-Glare)?\s*[-–]\s*/i, '').trim();
          brandMap[brand].add(cleanTitle || name);
        }
      } else if (brand === 'Samsung') {
        const samMatches = name.match(/Galaxy\s+[SZA]\d+\s*(?:Ultra|Plus|\+|FE)?/gi);
        if (samMatches && samMatches.length > 0) {
          samMatches.forEach(m => brandMap[brand].add(m.trim()));
        } else {
          const cleanTitle = name.replace(/^Sync\s+(?:EZ\s+Fit|Privacy\s+Armor|Matte\s+Anti-Glare)?\s*[-–]\s*/i, '').trim();
          brandMap[brand].add(cleanTitle || name);
        }
      } else {
        const cleanTitle = name.replace(/^Sync\s+(?:EZ\s+Fit|Privacy\s+Armor|Matte\s+Anti-Glare)?\s*[-–]\s*/i, '').trim();
        brandMap[brand].add(cleanTitle || name);
      }
    });

    const result = {};
    Object.keys(brandMap).forEach(b => {
      const list = Array.from(brandMap[b]).filter(Boolean);
      if (list.length > 0) {
        result[b] = list;
      }
    });

    return Object.keys(result).length > 0 ? result : { 'iPhone': ['iPhone 16 Pro Max', 'iPhone 15 Pro Max', 'iPhone 14 Pro Max'] };
  }, [products]);

  // Keep dropdown selection valid when admin products change
  useEffect(() => {
    const brands = Object.keys(deviceModelsByBrand);
    if (brands.length > 0) {
      if (!deviceModelsByBrand[selectedBrand]) {
        const firstBrand = brands[0];
        setSelectedBrand(firstBrand);
        setSelectedModel(deviceModelsByBrand[firstBrand][0] || '');
      } else if (!deviceModelsByBrand[selectedBrand]?.includes(selectedModel)) {
        setSelectedModel(deviceModelsByBrand[selectedBrand][0] || '');
      }
    }
  }, [deviceModelsByBrand, selectedBrand, selectedModel]);

  const handleAddToCart = (prod, e) => {
    if (e) e.stopPropagation();
    addToCart(prod, 1);
    setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 2000);
  };

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab || (activeTab === 'bestseller' && p.is_best_seller));

  const handleDeviceFinderSearch = () => {
    navigate(`/products?search=${encodeURIComponent(selectedModel)}`);
  };

  const scrollToFinder = () => {
    const el = document.getElementById('device-finder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-hidden bg-[#FAFAFA]">
      
      {/* ── 1. Minimalist Cinema Hero Section ── */}
      <section 
        className="relative w-full bg-[#09090b] text-white overflow-hidden border-b border-zinc-800/80 min-h-[calc(100svh-64px)] md:min-h-[640px] lg:min-h-[720px] flex items-center justify-center"
      >
        {/* Desktop / Laptop Background Imagery (md:block) */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Sync Screen Guard Precision Armor"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/hero-bg.png';
            }}
            className="w-full h-full object-cover object-center lg:object-[center_right] select-none scale-[1.01]"
          />
          {/* Refined gradient masks for laptop layout */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 lg:from-black/90 lg:via-black/60 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        </div>

        {/* Mobile Background Imagery (Full-screen vertical image) */}
        <div className="md:hidden absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src={mobileHeroBgImage}
            alt="Sync Screen Guard Precision Armor"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/hero-bg-mobile.png';
            }}
            className="w-full h-full object-cover object-center select-none scale-100"
          />
          {/* Gradients to keep both top-left title and bottom action buttons legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90" />
        </div>

        {/* Hero Content Stage: Mobile is Split (Title Top-Left, Buttons Bottom), Desktop is Centered Left */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-h-[calc(100svh-64px)] md:min-h-0 flex flex-col justify-between md:justify-center py-6 sm:py-20 lg:py-32">
          
          {/* Top Section / Title (Left-aligned on Mobile Top) */}
          <div className="max-w-2xl text-left pt-2 sm:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sync Screen Guard
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] uppercase text-left">
                Flawless clarity. <br />
                <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                  Unrivaled defense.
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Bottom Section / Actions & Chips */}
          <div className="max-w-2xl text-left space-y-3.5 pt-6 md:pt-8 pb-2">
            {/* Action Buttons */}
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
                <span>Shop Protectors</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={scrollToFinder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/80 px-6 py-3 sm:px-7 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-200 hover:text-white transition-all backdrop-blur-md active:scale-95 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Find For My Phone</span>
              </button>
            </motion.div>

         
          </div>

        </div>

      </section>

      {/* ── Lower Content Sections (Clean Spacing) ── */}
      <div className="space-y-10 sm:space-y-16 mt-6 sm:mt-14 w-full">

        {/* ── 2. Featured Bestsellers & Products Grid (Directly Under Hero) ── */}
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

          {/* Product Grid - Single Card on Mobile, Multi-col on Tablet & Desktop */}
          {filteredProducts.length > 0 ? (
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
              <p className="text-xs font-bold text-zinc-400 uppercase">No products found</p>
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

        {/* ── 3. Quick Device Compatibility Finder ── */}
        <section id="device-finder-section" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 p-4 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
              
              <div className="space-y-1 max-w-md">
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Instant Compatibility Finder</span>
                </div>
                <h3 className="font-display text-base sm:text-2xl font-black uppercase tracking-tight text-white">
                  Find Guaranteed Fit For Your Device
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">Select your smartphone brand and exact model to view compatible screen armor.</p>
              </div>

              {/* Selectors */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <div className="space-y-1 flex-1 sm:flex-initial">
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedModel(deviceModelsByBrand[e.target.value][0]);
                    }}
                    className="w-full sm:w-44 rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-2.5 sm:px-3.5 sm:py-2.5 text-xs font-bold text-white focus:border-white focus:outline-none cursor-pointer"
                  >
                    {Object.keys(deviceModelsByBrand).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 flex-1 sm:flex-initial">
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Model</label>
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
                    <span>Find Glass</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
