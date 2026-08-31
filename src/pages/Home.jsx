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

// Clean, High-Tech Hero Banners Data - Rich Multi-Tone Typography & Dynamic Themes
const HERO_BANNERS = [
  {
    id: 1,
    tag: 'Flagship iPhone Series',
    badgeText: 'PATENTED AUTO-ALIGN TRAY',
    titlePrefix: 'THE REVOLUTIONARY',
    titleHighlight: '10-SECOND AUTO-ALIGN',
    titleSuffix: 'BOX FOR iPHONE',
    subtitle: 'Zero bubbles. Zero dust. Aerospace-grade 9H tempered glass with our patented 1-pull auto-alignment applicator tray.',
    specs: [
      { icon: '⚡', label: '10s Quick Fit', desc: 'Pull & Release Box' },
      { icon: '💎', label: '9H Diamond Armor', desc: 'Shatterproof Glass' },
      { icon: '🛡️', label: 'Zero Dust System', desc: 'Static Film Tech' }
    ],
    features: ['⚡ 10s Fast Applicator', '💎 9H Diamond Glass', '🛡️ Zero Dust Tech'],
    price: 640,
    originalPrice: 1299,
    discount: '50% OFF',
    tabTitle: 'Auto-Align Box',
    ctaText: 'Shop EZ-Fit Box',
    link: '/products?search=iPhone',
    image: heroIphoneAlign,
    mobileImage: heroIphoneAlignMobile,
    accentGradient: 'from-emerald-400 via-teal-300 to-cyan-200',
    themeColor: '#34d399',
    glowColor: 'bg-emerald-500/20',
    borderGlow: 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    pillBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 2,
    tag: 'Anti-Spy Security Armor',
    badgeText: '28° NARROW-ANGLE DEFENSE',
    titlePrefix: 'ULTRA-DEFENSE',
    titleHighlight: '28° PRIVACY SHIELD',
    titleSuffix: 'FOR iPHONE',
    subtitle: 'Keeps confidential texts & banking details invisible to prying side glances while preserving crystal-clear OLED front viewing.',
    specs: [
      { icon: '👁️', label: '28° Anti-Spy Field', desc: 'True Blackout Angle' },
      { icon: '✨', label: '4K OLED Clarity', desc: 'Zero Pixel Distortion' },
      { icon: '🔒', label: 'Edge-to-Edge', desc: 'Case Friendly 3D' }
    ],
    features: ['👁️ 28° Anti-Spy Shield', '✨ 4K OLED Clarity', '🔒 Side Glance Block'],
    price: 740,
    originalPrice: 1499,
    discount: '51% OFF',
    tabTitle: 'Privacy Armor',
    ctaText: 'Shop Privacy Shield',
    link: '/products?category=privacy',
    image: heroIphonePrivacy,
    mobileImage: heroIphonePrivacyMobile,
    accentGradient: 'from-cyan-400 via-sky-300 to-blue-200',
    themeColor: '#38bdf8',
    glowColor: 'bg-cyan-500/20',
    borderGlow: 'border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]',
    pillBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 3,
    tag: 'Pro Mobile Gaming Series',
    badgeText: 'MICRO-ETCHED SILK TOUCH',
    titlePrefix: 'PRO GAMING',
    titleHighlight: 'SILK-MATTE ANTI-GLARE',
    titleSuffix: 'FOR iPHONE',
    subtitle: 'Zero fingerprint smudges, zero sun glare, and buttery-smooth frictionless touch response engineered for competitive mobile gaming.',
    specs: [
      { icon: '🎮', label: 'Pro Silk-Touch', desc: 'Frictionless Swiping' },
      { icon: '☀️', label: 'Anti-Sun Glare', desc: 'Outdoor Readability' },
      { icon: '🖐️', label: 'Oleophobic Armor', desc: 'Zero Sweat & Oil' }
    ],
    features: ['🎮 Pro Silk-Touch', '☀️ Anti-Glare Matte', '🖐️ Zero Smudge'],
    price: 680,
    originalPrice: 1299,
    discount: '48% OFF',
    tabTitle: 'Silk-Matte Shield',
    ctaText: 'Shop Matte Shield',
    link: '/products?category=matte',
    image: heroIphoneMatte,
    mobileImage: heroIphoneMatteMobile,
    accentGradient: 'from-fuchsia-400 via-purple-300 to-pink-200',
    themeColor: '#e879f9',
    glowColor: 'bg-fuchsia-500/20',
    borderGlow: 'border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.2)]',
    pillBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
  },
  {
    id: 4,
    tag: 'Titanium Camera Defense',
    badgeText: 'DIAMOND-HARD SAPPHIRE RINGS',
    titlePrefix: 'AEROSPACE GRADE',
    titleHighlight: 'SAPPHIRE LENS ARMOR',
    titleSuffix: 'FOR iPHONE 16 / 15 PRO',
    subtitle: 'Diamond-hard sapphire crystal protection with individual CNC titanium rings for ultra-crisp night photos with zero flash glare.',
    specs: [
      { icon: '💎', label: 'Sapphire Crystal', desc: '9H Scratch Proof' },
      { icon: '📸', label: 'Anti-Reflection AR', desc: 'Zero Flash Halo' },
      { icon: '🛡️', label: 'Titanium Bezel', desc: 'CNC Exact Color Fit' }
    ],
    features: ['💎 Sapphire Crystal', '📸 Zero Flash Flare', '🛡️ Titanium Ring'],
    price: 490,
    originalPrice: 999,
    discount: '51% OFF',
    tabTitle: 'Sapphire Lens',
    ctaText: 'Shop Camera Armor',
    link: '/products?search=Camera',
    image: heroIphoneCamera,
    mobileImage: heroIphoneCameraMobile,
    accentGradient: 'from-amber-300 via-orange-300 to-yellow-200',
    themeColor: '#f59e0b',
    glowColor: 'bg-amber-500/20',
    borderGlow: 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    pillBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
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

  const scrollToFinder = () => {
    const el = document.getElementById('device-finder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentBanner = HERO_BANNERS[currentSlide];

  // Smooth slide animations
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] }
    })
  };

  return (
    <div className="w-full pb-20 overflow-hidden bg-[#09090b]">
      
      {/* ── 1. Full-Screen Edge-to-Edge Cinema Hero Section ── */}
      <section 
        className="relative w-full bg-[#09090b] text-white overflow-hidden border-b border-zinc-800/80 min-h-[640px] md:min-h-[700px] lg:min-h-[760px] xl:min-h-[820px] flex flex-col justify-between"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-Screen Edge-to-Edge Background Imagery with Smooth Transitions */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          >
            {/* Desktop / Laptop Full-Screen Background Image */}
            <img
              src={currentBanner.image}
              alt={currentBanner.titleHighlight}
              className="hidden md:block w-full h-full object-cover object-center lg:object-[center_right] xl:object-right"
            />
            {/* Mobile Full-Screen Background Image */}
            <img
              src={currentBanner.mobileImage || currentBanner.image}
              alt={currentBanner.titleHighlight}
              className="md:hidden w-full h-full object-cover object-center"
            />

            {/* Laptop / Desktop Cinematic Gradient Masks (Crisp text on left, vivid fixing action on right) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent via-50% z-10" />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/40 z-10" />

            {/* Mobile Cinematic Gradient Masks */}
            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/80 to-black/40 z-10" />

            {/* Ambient Radial Theme Color Aura */}
            <div 
              className="absolute top-1/4 left-10 w-[500px] lg:w-[700px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none z-10 transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${currentBanner.themeColor} 0%, transparent 70%)`
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Foreground Content Stage */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 flex-1 flex flex-col justify-center">
          
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${currentSlide}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              
              {/* ── Left Column: High-Precision Typography & Controls (7 Cols) ── */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5">
                
                {/* Status & Tag Pill */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all ${currentBanner.pillBg}`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest font-mono">
                      {currentBanner.tag}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/15 text-zinc-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                    <span>{currentBanner.badgeText}</span>
                  </div>
                </div>

                {/* Headline & Slogan */}
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-zinc-400">
                    <span className="h-[2px] w-6 sm:w-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] font-mono text-zinc-300">
                      {currentBanner.titlePrefix}
                    </span>
                    <span className="h-[2px] w-6 sm:w-10 rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400 lg:hidden" />
                  </div>

                  <h1 className="font-display tracking-tight leading-[1.05] sm:leading-[1.02]">
                    <span className={`block font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight bg-gradient-to-r ${currentBanner.accentGradient} bg-clip-text text-transparent drop-shadow-sm`}>
                      {currentBanner.titleHighlight}
                    </span>
                    <span className="block font-black text-lg sm:text-2xl lg:text-3xl text-white/95 uppercase tracking-wider mt-1 drop-shadow-sm">
                      {currentBanner.titleSuffix}
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-sm">
                  {currentBanner.subtitle}
                </p>

                {/* Interactive Tech Specs Mini Grid (Glass Cards) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xl pt-1">
                  {currentBanner.specs.map((sp, idx) => (
                    <div 
                      key={idx}
                      className="group relative rounded-2xl bg-black/60 hover:bg-black/80 border border-white/15 hover:border-white/30 p-2.5 sm:p-3 transition-all duration-300 backdrop-blur-xl flex flex-col items-center lg:items-start text-center lg:text-left shadow-lg"
                    >
                      <div className="text-base sm:text-lg mb-1">{sp.icon}</div>
                      <div className="text-[11px] sm:text-xs font-black text-zinc-100 uppercase tracking-tight line-clamp-1">
                        {sp.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-zinc-300 font-medium line-clamp-1">
                        {sp.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing & Callout Banner */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-sm">
                      ₹{currentBanner.price}
                    </span>
                    <span className="text-sm sm:text-base text-zinc-400 line-through font-bold">
                      ₹{currentBanner.originalPrice}
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                    {currentBanner.discount}
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-300 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Free Applicator Kit Included
                  </span>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                  <Link
                    to={currentBanner.link}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-100 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] active:scale-98 cursor-pointer"
                  >
                    <span>{currentBanner.ctaText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <button
                    onClick={scrollToFinder}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/20 px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-200 hover:text-white transition-all backdrop-blur-xl active:scale-98 cursor-pointer shadow-lg"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    <span>Check My Phone Fit</span>
                  </button>
                </div>

                {/* Rating & Social Proof */}
                <div className="flex items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-zinc-300">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.9/5</span>
                  <span className="text-zinc-400">•</span>
                  <span>15,000+ Screen Protections Delivered</span>
                </div>

              </div>

              {/* ── Right Column: Floating High-Tech HUD Badges over Full-Screen Artwork (5 Cols) ── */}
              <div className="hidden lg:flex lg:col-span-5 flex-col items-end justify-center space-y-6 pointer-events-none">
                
                {/* Floating HUD Tag 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="px-4 py-2.5 rounded-2xl bg-black/75 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-3 pointer-events-auto hover:scale-105 transition-transform"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  <div>
                    <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Patented System</div>
                    <div className="text-xs font-black text-white uppercase tracking-tight">1-Pull Auto Alignment Tray</div>
                  </div>
                </motion.div>

                {/* Floating HUD Tag 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="px-4 py-3 rounded-2xl bg-black/75 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-6 pointer-events-auto hover:scale-105 transition-transform"
                >
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Guaranteed Results</div>
                    <div className="text-xs font-black text-white uppercase tracking-tight">100% Bubble & Dust-Free</div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    ✓
                  </div>
                </motion.div>

              </div>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Navigation Chevrons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 text-white backdrop-blur-xl border border-white/20 hover:bg-black/90 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-2xl"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 text-white backdrop-blur-xl border border-white/20 hover:bg-black/90 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-2xl"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* ── Bottom Section: Floating 4-Slide Interactive Controller Deck ── */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pb-4 sm:pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {HERO_BANNERS.map((banner, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={banner.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl shadow-lg ${
                    isActive 
                      ? 'bg-black/85 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.12)]' 
                      : 'bg-black/50 hover:bg-black/75 border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* Live Progress Bar for Active Slide */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 transition-all ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        0{idx + 1}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-tight truncate ${
                        isActive ? 'text-white' : 'text-zinc-300'
                      }`}>
                        {banner.tabTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300">
                      ₹{banner.price}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-400 truncate mt-1">
                    {banner.badgeText}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </section>

      {/* ── Integrated Hero Trust & Feature Strip ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-xl text-xs shadow-xl">
          <div className="flex items-center gap-3 text-zinc-300">
            <div className="h-9 w-9 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shrink-0 font-bold shadow-md">
              ⚡
            </div>
            <div>
              <div className="font-extrabold text-white uppercase text-[11px] sm:text-xs">10-Second Auto Align</div>
              <div className="text-[10px] text-zinc-400">Zero bubbles & dust-free box</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <div className="h-9 w-9 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-cyan-400 shrink-0 font-bold shadow-md">
              🛡️
            </div>
            <div>
              <div className="font-extrabold text-white uppercase text-[11px] sm:text-xs">9H Diamond Defense</div>
              <div className="text-[10px] text-zinc-400">Aerospace drop protection</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <div className="h-9 w-9 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-purple-400 shrink-0 font-bold shadow-md">
              ✨
            </div>
            <div>
              <div className="font-extrabold text-white uppercase text-[11px] sm:text-xs">Oleophobic Coating</div>
              <div className="text-[10px] text-zinc-400">Zero fingerprint smudges</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <div className="h-9 w-9 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-md">
              🚚
            </div>
            <div>
              <div className="font-extrabold text-white uppercase text-[11px] sm:text-xs">Free Fast Shipping</div>
              <div className="text-[10px] text-zinc-400">Dispatched within 24 hours</div>
            </div>
          </div>
        </div>
      </div>

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
              <h2 className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
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
            <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-zinc-800">
              <ShieldCheck className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase">No products in this category</p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-colors border border-zinc-700/60 shadow-md"
            >
              <span>View Complete Catalog ({products.length} Products)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── 3. Quick Device Compatibility Finder ── */}
        <section id="device-finder-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
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
