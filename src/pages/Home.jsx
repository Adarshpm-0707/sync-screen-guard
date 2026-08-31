import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, ShieldCheck, Sparkles, 
  ArrowRight, Star, Truck, RefreshCw, Zap, Check, 
  Smartphone, Award, Play, Eye, Layers, Lock,
  ShoppingBag, Shield
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts } from '../utils/productStore';
import ProductCard from '../components/product/ProductCard';

// Clean, Uncluttered Hero Banners Data
const HERO_BANNERS = [
  {
    id: 1,
    tag: 'Flagship 9H Tempered Glass',
    title: 'The 10-Second Auto Align Revolution',
    subtitle: 'Zero bubbles. Zero dust. Aerospace-grade 9H tempered glass with patented auto-align applicator box.',
    price: 640,
    originalPrice: 1299,
    discount: '50% OFF',
    ctaText: 'Shop EZ-Fit Glass',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-zinc-950 via-zinc-900 to-black'
  },
  {
    id: 2,
    tag: 'Anti-Spy Privacy Armor',
    title: '28° Narrow-Angle Privacy Defense',
    subtitle: 'Blocks prying side glances in public while maintaining ultra-vivid front HD OLED clarity and touch response.',
    price: 740,
    originalPrice: 1499,
    discount: '51% OFF',
    ctaText: 'Shop Privacy Armor',
    link: '/products?category=privacy',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-slate-950 via-zinc-900 to-black'
  },
  {
    id: 3,
    tag: 'Pro Gaming & Outdoor',
    title: 'Silk-Matte Anti-Glare Shield',
    subtitle: 'Micro-etched matte finish eliminates reflections and fingerprint smudges for ultra-smooth gaming swipes.',
    price: 680,
    originalPrice: 1299,
    discount: '48% OFF',
    ctaText: 'Shop Matte Shield',
    link: '/products?category=matte',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-neutral-950 via-zinc-900 to-black'
  },
  {
    id: 4,
    tag: 'Galaxy Series Custom Fit',
    title: '3D Curved 9H Glass for Galaxy Ultra',
    subtitle: 'Engineered for ultrasonic fingerprint recognition with seamless 3D curved border coverage.',
    price: 690,
    originalPrice: 1399,
    discount: '51% OFF',
    ctaText: 'Shop Samsung Glass',
    link: '/products?category=samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-zinc-950 via-slate-900 to-black'
  }
];

// Circular / Icon Category Explorer
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '⚡', query: 'all', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=300' },
  { id: 'privacy', name: 'Privacy Armor', icon: '🕶️', query: 'privacy', image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=300' },
  { id: 'matte', name: 'Matte Anti-Glare', icon: '🎮', query: 'matte', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=300' },
]
const REVIEWS = [
  {
    name: 'Aarav Mehta',
    device: 'iPhone 15 Pro Max',
    rating: 5,
    title: 'The alignment box is magic!',
    comment: 'I usually ruin at least 1 screen protector installing it. The Sync auto-align box did it in 10 seconds with literally ZERO bubbles or lint. Pure magic.',
    verified: true,
  },
  {
    name: 'Rohan Sharma',
    device: 'Samsung Galaxy S24 Ultra',
    rating: 5,
    title: 'Flawless edge-to-edge curved fit',
    comment: 'The glass feels smoother than the original phone display. The fingerprint sensor works instantly without any issues. Super happy with the quality!',
    verified: true,
  },
  {
    name: 'Pooja Nair',
    device: 'iPhone 14 Pro',
    rating: 5,
    title: 'Best Privacy Screen Ever',
    comment: 'Nobody sitting next to me in the metro or office can see what is on my phone. The 28-degree angle cut works perfectly without making the screen too dim.',
    verified: true,
  }
];

const SLIDE_DURATION_MS = 5000; // 5 Seconds per slide

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [addedMap, setAddedMap] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  // Quick Device Finder state
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 15 Pro Max');

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

  // Smooth slide timer with progress bar and pause-on-hover
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 50;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentSlide((curr) => (curr + 1) % HERO_BANNERS.length);
          return 0;
        }
        return prev + (intervalStep / SLIDE_DURATION_MS) * 100;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
    setProgress(0);
  };

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

  const deviceModelsByBrand = {
    Apple: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 13 / 14'],
    Samsung: ['Galaxy S25 Ultra', 'Galaxy S24 Ultra', 'Galaxy S24 Plus', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy A55 / A35'],
    OnePlus: ['OnePlus 12', 'OnePlus 12R', 'OnePlus 11', 'OnePlus Nord 4', 'OnePlus Nord CE 4'],
    Google: ['Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a', 'Pixel 7 Pro']
  };

  const handleDeviceFinderSearch = () => {
    navigate(`/products?search=${encodeURIComponent(selectedModel)}`);
  };

  const currentBanner = HERO_BANNERS[currentSlide];

  // Smooth slide animations
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.35, ease: 'easeIn' }
    })
  };

  return (
    <div className="w-full pb-20 overflow-hidden">
      
      {/* ── 1. Spacious, Clean Full-Screen Hero Banner ── */}
      <section 
        className="relative w-full bg-zinc-950 text-white overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] xl:h-[78vh] flex items-center group select-none border-b border-zinc-800/60"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Slide */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient} flex items-center`}
          >
            {/* Clean Background Image with Subtle Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 lg:w-1/2 opacity-25 md:opacity-85 overflow-hidden pointer-events-none">
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="w-full h-full object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
            </div>

            {/* Slide Text Content (Spacious & Clean) */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-14 sm:py-16 w-full">
              <div className="max-w-xl space-y-5 sm:space-y-6">
                
                {/* Clean Category / Series Tag */}
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
                    {currentBanner.tag}
                  </span>
                </div>

                {/* Main Headline with generous line-height */}
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08]">
                  {currentBanner.title}
                </h1>

                {/* Concise Subtitle */}
                <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-lg">
                  {currentBanner.subtitle}
                </p>

                {/* Price & Discount */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="font-display text-2xl sm:text-3xl font-black text-white">
                    ₹{currentBanner.price}
                  </span>
                  <span className="text-sm text-zinc-500 line-through">
                    ₹{currentBanner.originalPrice}
                  </span>
                  <span className="rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs font-extrabold uppercase">
                    {currentBanner.discount}
                  </span>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <Link
                    to={currentBanner.link}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl active:scale-98 cursor-pointer"
                  >
                    <span>{currentBanner.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Minimalist Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 hover:scale-105 active:scale-95"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Minimalist Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 hover:scale-105 active:scale-95"
          aria-label="Next Banner"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Minimalist Bottom Slide Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 cursor-pointer h-2 ${
                currentSlide === idx 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </section>

      {/* ── Lower Content Sections (Clean Spacing) ── */}
      <div className="space-y-12 sm:space-y-16 mt-8 sm:mt-14 w-full">

        {/* ── 2. E-Commerce Trust & Guarantee Strip ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-zinc-900">Free Express Shipping</h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed mt-0.5">Dispatched in 24 hrs. Pan-India 48-72h delivery.</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-zinc-900">Zero Bubble Guarantee</h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed mt-0.5">100% bubble-free or free replacement.</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-zinc-900">EZ Auto-Align Tray</h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed mt-0.5">10-second alignment applicator in every box.</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-zinc-900">7-Day Easy Returns</h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium leading-relaxed mt-0.5">Zero-friction instant replacement support.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 3. Quick Device Compatibility Finder ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Smartphone className="h-4 w-4" />
                  <span>Instant Compatibility Finder</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Find Guaranteed Fit For Your Device
                </h3>
                <p className="text-xs text-zinc-400">Select your smartphone brand and exact model to view compatible screen armor.</p>
              </div>

              {/* Selectors */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="space-y-1 flex-1 sm:flex-initial">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedModel(deviceModelsByBrand[e.target.value][0]);
                    }}
                    className="w-full sm:w-44 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-white focus:border-white focus:outline-none cursor-pointer"
                  >
                    {Object.keys(deviceModelsByBrand).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 flex-1 sm:flex-initial">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full sm:w-56 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-xs font-bold text-white focus:border-white focus:outline-none cursor-pointer"
                  >
                    {(deviceModelsByBrand[selectedBrand] || []).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:self-end pt-1 sm:pt-0">
                  <button
                    onClick={handleDeviceFinderSearch}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98"
                  >
                    <span>Find Glass</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. Signature Circular Category Explorer ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-zinc-900">
              Explore Collections
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
              Curated screen protection for every smartphone
            </p>
          </div>

          {/* Centralized Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.query === 'all' ? '/products' : `/products?category=${cat.query}`}
                className="flex flex-col items-center group w-20 sm:w-24 md:w-28 text-center"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-zinc-100 border-2 border-zinc-200 group-hover:border-zinc-900 p-1 transition-all duration-300 overflow-hidden shadow-xs group-hover:scale-105">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-zinc-950 text-center tracking-tight transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-5 sm:mt-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              <span>View All Collections</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── 5. Bento Promotional Collection Grid ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Bento Item 1: Large Feature (7 Cols) */}
            <div 
              onClick={() => navigate('/products')}
              className="md:col-span-7 rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[280px] sm:min-h-[340px] group cursor-pointer border border-zinc-800"
            >
              <div className="absolute right-[-20px] bottom-[-20px] sm:right-[-40px] sm:bottom-[-40px] w-64 sm:w-80 h-64 sm:h-80 opacity-30 md:opacity-40 group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600"
                  alt="EZ Fit Applicator"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="relative z-10 max-w-md space-y-2.5 sm:space-y-3">
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patented Applicator
                </span>
                <h3 className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                  The 10-Second Auto Align Box
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Foolproof dust-extraction film aligns and applies in a single pull. Guaranteed zero bubbles and micrometer-accurate centering.
                </p>
              </div>
              <div className="relative z-10 pt-4 sm:pt-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-950 px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider group-hover:bg-zinc-200 transition-colors">
                  <span>Explore Applicators</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            {/* Bento Item 2: Privacy (5 Cols) */}
            <div 
              onClick={() => navigate('/products?category=privacy')}
              className="md:col-span-5 rounded-3xl bg-zinc-100 text-zinc-900 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px] sm:min-h-[340px] group cursor-pointer border border-zinc-200"
            >
              <div className="relative z-10 space-y-2.5 sm:space-y-3">
                <span className="rounded-full bg-zinc-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider inline-block">
                  Anti-Spy Armor
                </span>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-zinc-900 leading-tight">
                  28° Narrow Privacy Glass
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Keep sensitive banking, chats, and emails private from curious onlookers on subways, flights, and cafes.
                </p>
              </div>
              <div className="relative z-10 pt-4 sm:pt-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:translate-x-1 transition-transform">
                  <span>Shop Privacy Series</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
                <span className="text-2xl font-bold">🔒</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── 6. Featured Bestsellers Grid ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                Trending Bestsellers
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'glass', label: 'EZ-Fit Glass' },
                { id: 'privacy', label: 'Privacy' },
            
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAdded={!!addedMap[product.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
              <ShieldCheck className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-600 uppercase">No products in this category</p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs uppercase tracking-widest rounded-full transition-colors"
            >
              <span>View Complete Catalog ({products.length} Products)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── 7. "Why Choose Sync" Technical Feature Bar ── */}
        <section className="bg-zinc-900 text-white py-12 sm:py-16 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-1.5 sm:space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">The Sync Standard</span>
              <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                Engineered For Impact Resistance
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Every protector undergoes double ion-exchange tempering to withstand drops, keys, and daily hazards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-700 flex items-center justify-center text-emerald-400">
                  <Zap className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">10-Second Auto Alignment</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Custom alignment tray ensures foolproof centering and bubble-free installation every time.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-700 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">9H Diamond Hardness</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Aluminosilicate glass reinforced to resist knife scratches, coins, and high-impact falls.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-700 flex items-center justify-center text-emerald-400">
                  <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Oleophobic Nano-Coat</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Electroplated hydrophobic surface repels finger grease, makeup, and smudge residues seamlessly.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2.5">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-700 flex items-center justify-center text-emerald-400">
                  <RefreshCw className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">7-Day Replacement</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If you face any alignment or transit issue, we replace your screen guard with zero friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Customer Reviews ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Real Customer Feedback</span>
            <h2 className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
              Loved By 10,000+ Device Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {REVIEWS.map((rev, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900">"{rev.title}"</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{rev.name}</p>
                    <p className="text-[10px] text-zinc-500">{rev.device}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Check className="h-2.5 w-2.5" /> Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
