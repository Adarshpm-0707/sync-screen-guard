import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  ChevronRight,
  ShieldCheck,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import useCart from "../hooks/useCart";
import { fetchStoreProducts, DEFAULT_PRODUCTS } from "../utils/productStore";

// Generate frame paths using Vite's import.meta.glob for all frames
const frameModules = import.meta.glob("../assets/bg/ezgif-frame-*.jpg", {
  eager: true,
});

// Sort frames by filename to ensure correct order
const FRAMES = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key].default);

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addedMap, setAddedMap] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadCatalog() {
      const storeItems = await fetchStoreProducts();
      setProducts(storeItems);
    }
    loadCatalog();

    window.addEventListener("products_updated", loadCatalog);
    window.addEventListener("storage", loadCatalog);
    return () => {
      window.removeEventListener("products_updated", loadCatalog);
      window.removeEventListener("storage", loadCatalog);
    };
  }, []);

  // Canvas + scroll refs
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  // The tall spacer div that creates scroll distance
  const spacerRef = useRef(null);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  // We track which frame index to show as a state so the progress bar updates
  const [frameIndex, setFrameIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const scrollProgressRef = useRef(0);
  const [showMobileEndCard, setShowMobileEndCard] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [showHeroContent, setShowHeroContent] = useState(false);

  useEffect(() => {
    if (framesLoaded) {
      setShowHeroContent(true);
    }
  }, [framesLoaded]);

  const homeProducts = products.filter((p) => p.show_on_home !== false);
  const currentHero = homeProducts[0] || null;

  const handleAddToCart = (prod, e) => {
    if (e) e.stopPropagation();
    addToCart(prod, 1);
    setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(
      () => setAddedMap((prev) => ({ ...prev, [prod.id]: false })),
      2000,
    );
  };

  // Draw frame — if target isn't loaded yet, find nearest loaded neighbour
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgs = imagesRef.current;
    if (!imgs.length) return;

    // Search outward from index to find a loaded frame
    let img = null;
    for (let delta = 0; delta < imgs.length; delta++) {
      const candidate =
        imgs[Math.max(0, Math.min(imgs.length - 1, index - delta))];
      if (candidate && candidate.complete && candidate.naturalWidth) {
        img = candidate;
        break;
      }
      if (delta > 0) {
        const fwd = imgs[Math.min(imgs.length - 1, index + delta)];
        if (fwd && fwd.complete && fwd.naturalWidth) {
          img = fwd;
          break;
        }
      }
    }
    if (!img) return;

    const ctx = canvas.getContext("2d");
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const ox = (cw - nw) / 2;
    const oy = (ch - nh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, ox, oy, nw, nh);
  }, []);

  // Preload images — first 30 frames are high-priority (shown at top of page).
  // Remaining frames load in background. Animation starts after max 3 seconds.
  useEffect(() => {
    const PRIORITY_FRAMES = 30; // load these first
    const MAX_WAIT_MS = 3000; // force-start after this time regardless
    let priorityLoaded = 0;
    let totalLoaded = 0;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      setFramesLoaded(true);
      drawFrame(0);
    };

    // Force start after 3 seconds no matter what
    const forceTimer = setTimeout(start, MAX_WAIT_MS);

    const imgs = FRAMES.map((src, i) => {
      const img = new Image();
      img.onload = () => {
        totalLoaded++;
        setLoadProgress(Math.round((totalLoaded / FRAMES.length) * 100));

        if (i < PRIORITY_FRAMES) {
          priorityLoaded++;
          // Start as soon as all priority frames are ready
          if (priorityLoaded === PRIORITY_FRAMES) start();
        }
        // Also start if everything loaded before any timer
        if (totalLoaded === FRAMES.length) start();
      };
      img.onerror = () => {
        totalLoaded++;
      };
      img.src = src; // set src AFTER onload to avoid race on cached images
      return img;
    });

    imagesRef.current = imgs;
    return () => clearTimeout(forceTimer);
  }, [drawFrame]);

  // Keep canvas sized to viewport
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll-driven frame update
  useEffect(() => {
    if (!framesLoaded) return;

    const onScroll = () => {
      const spacer = spacerRef.current;
      if (!spacer) return;

      const rect = spacer.getBoundingClientRect();
      const scrolled = -rect.top;
      const maxScroll = spacer.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      scrollProgressRef.current = progress;
      setScrollProgress(progress);

      // On mobile show the text card when animation is near end
      if (window.innerWidth < 768) {
        setShowMobileEndCard(progress >= 0.75);
      } else {
        setShowMobileEndCard(false);
      }

      const idx = Math.min(
        Math.floor(progress * (FRAMES.length - 1)),
        FRAMES.length - 1,
      );

      if (idx !== currentFrameRef.current) {
        currentFrameRef.current = idx;
        setFrameIndex(idx);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(idx));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [framesLoaded, drawFrame]);

  // Smooth Section 1 opacity (0% to 33% scroll)
  const s1Opacity = scrollProgress <= 0.25 ? 1 : Math.max(0, 1 - (scrollProgress - 0.25) / 0.10);

  // Smooth Section 2 opacity (33% to 66% scroll)
  let s2Opacity = 0;
  if (scrollProgress >= 0.25 && scrollProgress <= 0.68) {
    if (scrollProgress < 0.35) s2Opacity = (scrollProgress - 0.25) / 0.10;
    else if (scrollProgress > 0.58) s2Opacity = Math.max(0, 1 - (scrollProgress - 0.58) / 0.10);
    else s2Opacity = 1;
  }

  // Smooth Section 3 opacity (66% to 100% scroll)
  const s3Opacity = scrollProgress < 0.60 ? 0 : Math.min(1, (scrollProgress - 0.60) / 0.10);

  return (
    <div className="relative w-full text-sky-950 font-sans selection:bg-sky-300">
      {/* ══ SCROLL ANIMATION ZONE ══ */}
      <div
        ref={spacerRef}
        style={{ height: isMobile ? "300vh" : "500vh" }}
        className="relative"
      >
        {/* Sticky viewport: canvas + overlays pinned to top */}
        <div
          className="sticky top-0 left-0 w-full overflow-hidden"
          style={{ height: "100svh" }}
        >
          {/* Loading screen */}
          {!framesLoaded && (
            <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center z-50">
              <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-150"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="mt-5 text-white/30 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase font-bold">
                Loading {loadProgress}%
              </p>
            </div>
          )}

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />

          {/* Gradient overlays — stronger on mobile bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none hidden sm:block" />

          {/* ── HERO CONTENT (DESKTOP + MOBILE) ── */}
          <div className="absolute inset-0 flex flex-col justify-between px-5 sm:px-20 pt-20 sm:pt-36 pb-6 sm:pb-20">

            {/* ══ MOBILE HERO OVERLAY (Only visible on Mobile view: flex sm:hidden) ══ */}
            <div className="flex sm:hidden flex-col justify-between h-full pt-4 pb-2 z-20 pointer-events-none">
              
              {/* Dynamic Scroll Text Cards on Mobile */}
              <div className="relative my-auto space-y-4 pt-6">
                {/* Mobile Phase 1: Privacy */}
                <div 
                  className="transition-all duration-500 space-y-3"
                  style={{
                    opacity: s1Opacity,
                    transform: `translateY(${(1 - s1Opacity) * 20}px)`,
                    display: s1Opacity > 0.05 ? 'block' : 'none'
                  }}
                >
                  <h1 className="text-[2.25rem] font-black text-white tracking-tighter uppercase leading-[0.92] drop-shadow-2xl">
                    Your Screen
                    <br />
                    <span className="font-thin italic text-sky-200">Your Privacy</span>
                  </h1>
                  <p className="text-white/75 text-xs font-semibold max-w-[280px] leading-relaxed drop-shadow-md">
                    Micro-louver optical technology blocks side glances beyond 28° while maintaining crystal-clear front viewing.
                  </p>
                </div>

                {/* Mobile Phase 2: 9H Hardness */}
                <div 
                  className="transition-all duration-500 space-y-3"
                  style={{
                    opacity: s2Opacity,
                    transform: `translateY(${(1 - s2Opacity) * 20}px)`,
                    display: s2Opacity > 0.05 ? 'block' : 'none'
                  }}
                >
                  <h1 className="text-[2.25rem] font-black text-white tracking-tighter uppercase leading-[0.92] drop-shadow-2xl">
                    9H Hardness.
                    <br />
                    <span className="font-thin italic text-cyan-300">Zero Refraction.</span>
                  </h1>
                  <p className="text-white/75 text-xs font-semibold max-w-[280px] leading-relaxed drop-shadow-md">
                    Reinforced molecular ion armor engineered for extreme scratch protection & oleophobic fingerprint resistance.
                  </p>
                </div>

                {/* Mobile Phase 3: EZ-Fit Tray */}
                <div 
                  className="transition-all duration-500 space-y-3"
                  style={{
                    opacity: s3Opacity,
                    transform: `translateY(${(1 - s3Opacity) * 20}px)`,
                    display: s3Opacity > 0.05 ? 'block' : 'none'
                  }}
                >
                  <h1 className="text-[2.25rem] font-black text-white tracking-tighter uppercase leading-[0.92] drop-shadow-2xl">
                    EZ-Fit Tray.
                    <br />
                    <span className="font-thin italic text-white/60">10s Sequence.</span>
                  </h1>
                  <p className="text-white/75 text-xs font-semibold max-w-[280px] leading-relaxed drop-shadow-md">
                    Auto-alignment tray guarantees flawless placement with zero dust, zero bubbles in under 10 seconds.
                  </p>
                </div>
              </div>

              {/* Mobile Quick Action Dock at Bottom */}
              <div className="w-full space-y-3 pointer-events-auto">
                {/* Specs HUD bar on mobile */}
                <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 text-center">
                  <div>
                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Resilience</p>
                    <p className="text-[11px] font-black text-white">9H ION</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Clarity</p>
                    <p className="text-[11px] font-black text-cyan-300">99.9% HD</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Sequence</p>
                    <p className="text-[11px] font-black text-white">10 SEC</p>
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(currentHero ? "/checkout" : "/products")}
                    className="flex-1 py-3.5 bg-white text-neutral-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentHero ? `Get Device ₹${currentHero.price}` : 'Explore Catalog'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {currentHero && (
                    <button
                      onClick={(e) => handleAddToCart(currentHero, e)}
                      className="px-4 py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
                    >
                      {addedMap[currentHero.id] ? "✓ Added" : "Add"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ══ DESKTOP HERO CONTENT (Hidden on Mobile: hidden sm:flex) ══ */}
            <div className="hidden sm:flex flex-col items-start justify-center relative min-h-[340px] mt-8 sm:mt-14">
              
              {/* Section 1: Privacy & Shield (0% to 32% scroll) */}
              <div 
                className="transition-all duration-700 space-y-5 max-w-xl"
                style={{
                  opacity: showHeroContent ? s1Opacity : 0,
                  transform: `translateY(${(1 - s1Opacity) * 25}px)`,
                  pointerEvents: s1Opacity > 0.4 ? 'auto' : 'none',
                  display: s1Opacity > 0.01 ? 'block' : 'none'
                }}
              >
               
                <h1 className="text-[2.5rem] sm:text-[5rem] lg:text-[6rem] font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                  Your Screen
                  <br />
                  <span className="font-thin italic text-white/50">Your Privacy</span>
                </h1>
                <p className="text-white/70 text-sm font-medium max-w-sm leading-relaxed">
                  Premium privacy screen protector engineered to protect your display while keeping your view confidential.
                </p>
              </div>

              {/* Section 2: Molecular Armor (33% to 65% scroll) */}
              <div 
                className="transition-all duration-700 space-y-5 max-w-xl"
                style={{
                  opacity: s2Opacity,
                  transform: `translateY(${(1 - s2Opacity) * 25}px)`,
                  pointerEvents: s2Opacity > 0.4 ? 'auto' : 'none',
                  display: s2Opacity > 0.01 ? 'block' : 'none'
                }}
              >
              
                <h1 className="text-[2.5rem] sm:text-[5rem] lg:text-[6rem] font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                  9H Hardness.
                  <br />
                  <span className="font-thin italic text-sky-300">Zero Refraction.</span>
                </h1>
                <p className="text-white/70 text-sm font-medium max-w-sm leading-relaxed">
                  Reinforced ion armor with 99.9% optical transparency and ultra-smooth oleophobic finish.
                </p>
              </div>

              {/* Section 3: Instant EZ-Fit & Purchase CTA (66% to 100% scroll) */}
              <div 
                className="transition-all duration-700 space-y-5 max-w-xl"
                style={{
                  opacity: s3Opacity,
                  transform: `translateY(${(1 - s3Opacity) * 25}px)`,
                  pointerEvents: s3Opacity > 0.4 ? 'auto' : 'none',
                  display: s3Opacity > 0.01 ? 'block' : 'none'
                }}
              >
           
                <h1 className="text-[2.5rem] sm:text-[5rem] lg:text-[6rem] font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                  EZ-Fit Tray.
                  <br />
                  <span className="font-thin italic text-white/50">10s Sequence.</span>
                </h1>
                <p className="text-white/70 text-sm font-medium max-w-sm leading-relaxed">
                  Revolutionary auto-alignment tray. Zero dust, zero bubbles in under 10 seconds flat.
                </p>
                {currentHero && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-neutral-950 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all shadow-2xl flex items-center gap-2 cursor-pointer"
                    >
                      Get Device ₹{currentHero.price}
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(currentHero, e)}
                      className="px-5 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-2xl border border-white/25 text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] hover:bg-white/20 transition-all cursor-pointer"
                    >
                      {addedMap[currentHero.id] ? "✓ Synced" : "Add to Cart"}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom HUD — hidden on mobile, shown on desktop */}
            <div className="hidden sm:flex justify-between items-end">
              <div className="flex gap-10">
                {[
                  { label: "Resilience", value: "9H ION" },
                  { label: "Clarity", value: "99.9% ULTRA" },
                  { label: "Shield", value: "360° GUARD" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="w-32 h-[1px] bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full transition-none"
                    style={{ width: `${framesLoaded ? (frameIndex / (FRAMES.length - 1)) * 100 : 0}%` }}
                  />
                </div>
                <motion.p
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]"
                >
                  ↓ Scroll to explore
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BELOW-FOLD CONTENT ── */}
      <div className="relative bg-[#E0F2FE] z-10">
        {/* Feature tiles */}
        <section className="px-4 sm:px-6 py-16 sm:py-32 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.5em] mb-4">
              Why Sync
            </p>
            <h2 className="text-5xl sm:text-7xl font-black text-sky-950 tracking-tighter uppercase leading-none">
              Core
              <br />
              Technology.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: ShieldCheck,
                t: "Molecular Armor",
                d: "Hardened ions provide extreme impact resistance.",
              },
              {
                icon: Eye,
                t: "Zero Refraction",
                d: "Pixel-perfect clarity through high-index glass.",
              },
              {
                icon: Zap,
                t: "EZ-Sync Tray",
                d: "Patented box for 10-second auto-alignment.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                whileHover={{ y: -10 }}
                className="p-10 bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[48px] space-y-6 shadow-sm hover:shadow-xl hover:shadow-sky-400/10 transition-all"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-sky-100 rounded-3xl">
                  <f.icon className="w-8 h-8 text-sky-600" />
                </div>
                <h3 className="text-2xl font-black text-sky-950 uppercase tracking-tighter leading-none">
                  {f.t}
                </h3>
                <p className="text-sky-800/70 font-medium leading-relaxed">
                  {f.d}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Product showcase */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-40 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-[1px] bg-sky-400" />
                <span className="text-sky-500 font-black text-[10px] uppercase tracking-[0.5em]">
                  The Catalog
                </span>
              </div>
              <h2 className="text-6xl font-black text-sky-950 tracking-tighter uppercase leading-none">
                Core_Series
              </h2>
            </div>
            <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-sky-600 group">
              View All Systems{" "}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          {homeProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-12">
              {homeProducts.map((p, i) => {
                const discountPercent = p.original_price && p.price && Number(p.original_price) > Number(p.price) 
                  ? Math.round(((Number(p.original_price) - Number(p.price)) / Number(p.original_price)) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    whileHover={{ y: -10 }}
                    className="group relative bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[32px] sm:rounded-[60px] p-4 sm:p-8 transition-all hover:shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/5] bg-sky-100/50 rounded-[28px] sm:rounded-[48px] overflow-hidden mb-4 sm:mb-10 relative">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                          alt={p.name}
                        />

                        {/* 🔥 Best Seller Badge */}
                        {p.is_best_seller && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse z-10">
                            <span>🔥 BEST SELLER</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 p-2 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl flex justify-between items-center border border-white">
                          <span className="text-[8px] sm:text-[10px] font-black text-sky-900 uppercase tracking-widest">
                            {p.category}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs sm:text-base font-black text-sky-950">
                              ₹{p.price}
                            </span>
                            {p.original_price && Number(p.original_price) > Number(p.price) && (
                              <span className="text-[9px] sm:text-xs text-sky-700/60 line-through font-bold">
                                ₹{p.original_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4 px-1 sm:px-2">
                        <h3 className="text-base sm:text-2xl font-black text-sky-950 uppercase tracking-tighter leading-tight line-clamp-2">
                          {p.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {p.is_best_seller && (
                            <div className="px-2.5 sm:px-3.5 py-1 bg-amber-400 text-slate-950 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-sm">
                              🔥 Best Seller
                            </div>
                          )}
                          {discountPercent > 0 && (
                            <div className="px-2.5 sm:px-3.5 py-1 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-wider shadow-sm">
                              {discountPercent}% OFF
                            </div>
                          )}
                          <div className="px-2 sm:px-3 py-1 bg-sky-900 text-sky-50 rounded-xl text-[8px] font-black uppercase tracking-widest">
                            9H ION
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 px-1 sm:px-2">
                      <button
                        onClick={() => navigate("/product", { state: { product: p } })}
                        className="w-full py-3 sm:py-5 rounded-2xl sm:rounded-[28px] bg-sky-900 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-sky-800 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-sky-200/40 border border-sky-300/50 rounded-[40px] p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-300/40 text-sky-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-sky-950 uppercase tracking-tight">No Products Added Yet</h3>
              <p className="text-xs text-sky-700 font-bold uppercase tracking-wider">
                Only products added by the Admin are shown. Admin can add products in the Admin Panel.
              </p>
              <button
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 bg-sky-900 text-sky-50 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-800 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Go to Admin Products
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

