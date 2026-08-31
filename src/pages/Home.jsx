import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, ShieldCheck, 
  ArrowRight, Star, Smartphone
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { fetchStoreProducts } from '../utils/productStore';
import ProductCard from '../components/product/ProductCard';
import heroIphoneAlign from '../assets/hero-iphone-align.jpg';
import heroIphoneAlignMobile from '../assets/hero-iphone-align-mobile.jpg';
import heroIphonePrivacy from '../assets/hero-iphone-privacy.jpg';
import heroIphonePrivacyMobile from '../assets/hero-iphone-privacy-mobile.jpg';
import heroIphoneMatte from '../assets/hero-iphone-matte.jpg';
import heroIphoneMatteMobile from '../assets/hero-iphone-matte-mobile.jpg';
import heroIphoneCamera from '../assets/hero-iphone-camera.jpg';
import heroIphoneCameraMobile from '../assets/hero-iphone-camera-mobile.jpg';

// Clean, Uncluttered Hero Banners Data - Exclusively iPhone Focused with Rich Multi-Tone Typography
const HERO_BANNERS = [
  {
    id: 1,
    tag: 'Flagship iPhone Series',
    badgeText: 'PATENTED AUTO-ALIGN TRAY',
    titlePrefix: 'THE 10-SECOND',
    titleHighlight: 'AUTO ALIGN BOX',
    titleSuffix: 'FOR iPHONE',
    subtitle: 'Zero bubbles. Zero dust. Aerospace-grade 9H tempered glass with patented auto-alignment applicator tray.',
    features: ['⚡ 10s Fast Applicator', '💎 9H Diamond Glass', '🛡️ Zero Dust Tech'],
    price: 640,
    originalPrice: 1299,
    discount: '50% OFF',
    ctaText: 'Shop EZ-Fit Glass',
    link: '/products?search=iPhone',
    image: heroIphoneAlign,
    mobileImage: heroIphoneAlignMobile,
    accentGradient: 'from-emerald-400 via-teal-300 to-cyan-200',
    glowColor: 'bg-emerald-500/20'
  },
  {
    id: 2,
    tag: 'Anti-Spy Security Armor',
    badgeText: '28° NARROW-ANGLE DEFENSE',
    titlePrefix: 'ULTRA-SHIELD',
    titleHighlight: 'PRIVACY GLASS',
    titleSuffix: 'FOR iPHONE',
    subtitle: 'Blocks prying side glances in public while maintaining ultra-vivid Dynamic Island and front OLED clarity.',
    features: ['👁️ 28° Anti-Spy Shield', '✨ 4K OLED Clarity', '🔒 Side Glance Block'],
    price: 740,
    originalPrice: 1499,
    discount: '51% OFF',
    ctaText: 'Shop Privacy Armor',
    link: '/products?category=privacy',
    image: heroIphonePrivacy,
    mobileImage: heroIphonePrivacyMobile,
    accentGradient: 'from-cyan-400 via-sky-300 to-indigo-300',
    glowColor: 'bg-cyan-500/20'
  },
  {
    id: 3,
    tag: 'Pro Mobile Gaming',
    badgeText: 'ZERO REFLECTIONS & SMUDGES',
    titlePrefix: 'SILK-MATTE',
    titleHighlight: 'ANTI-GLARE SHIELD',
    titleSuffix: 'FOR iPHONE',
    subtitle: 'Micro-etched matte finish eliminates reflections and fingerprint smudges for ultra-smooth gaming swipes.',
    features: ['🎮 Pro Silk-Touch', '☀️ Anti-Glare Matte', '🖐️ Zero Smudge'],
    price: 680,
    originalPrice: 1299,
    discount: '48% OFF',
    ctaText: 'Shop Matte Shield',
    link: '/products?category=matte',
    image: heroIphoneMatte,
    mobileImage: heroIphoneMatteMobile,
    accentGradient: 'from-fuchsia-400 via-purple-300 to-pink-200',
    glowColor: 'bg-purple-500/20'
  },
  {
    id: 4,
    tag: 'Titanium Camera Defense',
    badgeText: 'DIAMOND-HARD SAPPHIRE RINGS',
    titlePrefix: 'PRECISION',
    titleHighlight: 'SAPPHIRE LENS ARMOR',
    titleSuffix: 'FOR iPHONE 16 PRO',
    subtitle: 'Diamond-hard sapphire crystal protection for iPhone 16 Pro triple camera rings with zero flash flare.',
    features: ['💎 Sapphire Crystal', '📸 Zero Flash Flare', '🛡️ Titanium Ring'],
    price: 490,
    originalPrice: 999,
    discount: '51% OFF',
    ctaText: 'Shop Camera Lens Armor',
    link: '/products?search=Camera',
    image: heroIphoneCamera,
    mobileImage: heroIphoneCameraMobile,
    accentGradient: 'from-amber-300 via-orange-300 to-yellow-200',
    glowColor: 'bg-amber-500/20'
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
      
      {/* ── 1. Spacious, Clean Responsive Hero Banner ── */}
      <section 
        className="relative w-full bg-zinc-950 text-white overflow-hidden h-[calc(100vh-64px)] h-[calc(100dvh-64px)] min-h-[560px] md:max-h-[880px] flex items-center justify-center group select-none border-b border-zinc-800/60"
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
            className="absolute inset-0 w-full h-full flex items-center justify-center md:justify-start overflow-hidden"
          >
            {/* Full-Screen Edge-to-Edge Background Image (Responsive Mobile & Desktop) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              {/* Mobile Background Image (Clean iPhone Real Photo) */}
              <img
                src={currentBanner.mobileImage || currentBanner.image}
                alt={currentBanner.titlePrefix + ' ' + currentBanner.titleHighlight}
                className="md:hidden w-full h-full object-cover object-center"
              />
              {/* Desktop Background Image */}
              <img
                src={currentBanner.image}
                alt={currentBanner.titlePrefix + ' ' + currentBanner.titleHighlight}
                className="hidden md:block w-full h-full object-cover object-center"
              />

              {/* Mobile Gradient Overlay: ensures maximum text contrast over real photo */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40 backdrop-brightness-90" />
              
              {/* Desktop Gradient Overlay */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
            </div>

            {/* Slide Content (Overlaid directly over the background image) */}
            <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 w-full flex flex-col items-center md:items-start justify-center h-full pt-4 pb-10 sm:pb-12 md:py-0">
              
              {/* Text Information & Actions */}
              <div className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-4 md:space-y-5 text-center md:text-left w-full">
                
                {/* Modern Pill Tag & Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/80 backdrop-blur-xl border border-white/20 px-3.5 py-1.5 rounded-full shadow-lg mx-auto md:mx-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-100 font-mono">
                    {currentBanner.tag}
                  </span>
                  <span className="text-zinc-500 text-xs">•</span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {currentBanner.badgeText}
                  </span>
                </div>

                {/* ── MOBILE: Big Centered Impact Title ── */}
                {/* ── DESKTOP: Sleek Left-Aligned Title ── */}
                <div className="space-y-1 sm:space-y-1.5">

                  {/* ── Mobile Title Prefix (centered overline accent) ── */}
                  <div className="flex md:hidden items-center justify-center gap-3 mb-1">
                    <span className="h-[2px] w-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_#34d399]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300 font-mono drop-shadow-[0_1px_6px_rgba(52,211,153,0.8)]">
                      {currentBanner.titlePrefix}
                    </span>
                    <span className="h-[2px] w-10 rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400 shadow-[0_0_10px_#34d399]" />
                  </div>

                  {/* ── Mobile: Massive Impact Headline ── */}
                  <h1 className="md:hidden font-display tracking-tight leading-[1] drop-shadow-[0_6px_32px_rgba(0,0,0,0.98)] text-center">
                    <span className={`bg-gradient-to-r ${currentBanner.accentGradient} bg-clip-text text-transparent block font-black text-[2.6rem] xs:text-5xl uppercase tracking-tighter filter drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]`}
                      style={{ textShadow: 'none', WebkitTextStroke: '0px' }}>
                      {currentBanner.titleHighlight}
                    </span>
                    <span className="text-white/90 block font-black text-base uppercase tracking-[0.2em] mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                      {currentBanner.titleSuffix}
                    </span>
                  </h1>

                  {/* ── Desktop Title (unchanged, left-aligned) ── */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-start gap-2.5 mb-1">
                      <span className="h-[2px] w-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_8px_#34d399]" />
                      <span className="text-sm font-extrabold uppercase tracking-[0.25em] text-zinc-300 font-mono">
                        {currentBanner.titlePrefix}
                      </span>
                    </div>
                    <h1 className="font-display tracking-tight leading-[1.04] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
                      <span className={`bg-gradient-to-r ${currentBanner.accentGradient} bg-clip-text text-transparent block font-black text-6xl lg:text-7xl uppercase tracking-tighter filter drop-shadow-md`}>
                        {currentBanner.titleHighlight}
                      </span>
                      <span className="text-white block font-black text-2xl lg:text-3xl uppercase tracking-wider mt-1.5 opacity-95">
                        {currentBanner.titleSuffix}
                      </span>
                    </h1>
                  </div>

                </div>

                {/* Feature Chips Strip */}
                {currentBanner.features && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 pt-0.5">
                    {currentBanner.features.map((feat, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-zinc-200 shadow-sm"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Concise Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-normal leading-relaxed max-w-lg mx-auto md:mx-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 sm:line-clamp-none">
                  {currentBanner.subtitle}
                </p>

                {/* Price & Discount */}
                <div className="flex items-baseline justify-center md:justify-start gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
                  <span className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    ₹{currentBanner.price}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-400 line-through">
                    ₹{currentBanner.originalPrice}
                  </span>
                  <span className="rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
                    {currentBanner.discount}
                  </span>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2 sm:pt-3 flex justify-center md:justify-start">
                  <Link
                    to={currentBanner.link}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 sm:px-10 py-3.5 sm:py-4 text-xs font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.35)] active:scale-98 cursor-pointer"
                  >
                    <span>{currentBanner.ctaText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Minimalist Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Minimalist Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/15 hover:bg-black/80 transition-all flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Next Banner"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Minimalist Bottom Slide Indicator Dots */}
        <div className="absolute bottom-2.5 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-300 cursor-pointer h-1.5 sm:h-2 ${
                currentSlide === idx 
                  ? 'w-7 sm:w-8 bg-white' 
                  : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </section>

      {/* ── Lower Content Sections (Clean Spacing) ── */}
      <div className="space-y-12 sm:space-y-16 mt-8 sm:mt-14 w-full">

        {/* ── 2. Featured Bestsellers & Products Grid (Directly Under Hero) ── */}
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
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
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

      </div>

    </div>
  );
}
