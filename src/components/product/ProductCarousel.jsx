import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ChevronLeft, ChevronRight, Sparkles, Star, ArrowRight, Shield } from 'lucide-react';

gsap.registerPlugin(Draggable);

/* ─────────────────────────────────────────────────────────
   buildSeamlessLoop — GSAP seamless loop timeline builder.
   Scrubs raw sequence so it appears to loop seamlessly in either direction.
───────────────────────────────────────────────────────── */
function buildSeamlessLoop(items, spacing, animateFunc) {
  const overlap   = Math.ceil(1 / spacing);
  const startTime = items.length * spacing + 0.5;
  const loopTime  = (items.length + overlap) * spacing + 1;

  const rawSequence  = gsap.timeline({ paused: true });
  const seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      if (this._time === this._dur) this._tTime += this._dur - 0.01;
    },
  });

  const l = items.length + overlap * 2;
  for (let i = 0; i < l; i++) {
    const index = i % items.length;
    const time  = i * spacing;
    rawSequence.add(animateFunc(items[index]), time);
    if (i <= items.length) seamlessLoop.add('label' + i, time);
  }

  rawSequence.time(startTime);
  seamlessLoop
    .to(rawSequence, {
      time: loopTime,
      duration: loopTime - startTime,
      ease: 'none',
    })
    .fromTo(
      rawSequence,
      { time: overlap * spacing + 1 },
      {
        time: startTime,
        duration: startTime - (overlap * spacing + 1),
        immediateRender: false,
        ease: 'none',
      },
    );
  return seamlessLoop;
}

export default function ProductCarousel({ products = [] }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const cardsRef = useRef(null);
  const proxyRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const isDraggingRef = useRef(false);

  const goTo = useCallback(
    (product) => {
      if (isDraggingRef.current) return;
      navigate('/product', { state: { product } });
    },
    [navigate],
  );

  useEffect(() => {
    const cardsEl = cardsRef.current;
    const proxy = proxyRef.current;
    if (!cardsEl || !proxy) return;

    const cardEls = Array.from(cardsEl.querySelectorAll('li'));
    if (!cardEls.length) return;

    const SPACING = 0.1;
    const snapTime = gsap.utils.snap(SPACING);

    /* ── initial state ── */
    gsap.set(cardEls, { xPercent: 400, opacity: 0, scale: 0 });

    /* ── per-card 3D perspective animation ── */
    const animateFunc = (el) => {
      const tl = gsap.timeline();
      tl.fromTo(
          el,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false },
        )
        .fromTo(
          el,
          { xPercent: 400 },
          { xPercent: -400, duration: 1, ease: 'none', immediateRender: false },
          0,
        );
      return tl;
    };

    const loop = buildSeamlessLoop(cardEls, SPACING, animateFunc);
    const duration = loop.duration();
    const wrapTime = gsap.utils.wrap(0, duration);

    /* ── playhead proxy ── */
    const playhead = { offset: 0 };

    const scrub = gsap.to(playhead, {
      offset: 0,
      onUpdate() {
        loop.time(wrapTime(playhead.offset));
      },
      duration: 0.5,
      ease: 'power3',
      paused: true,
    });

    const snapOffset = () => {
      const snapped = snapTime(scrub.vars.offset);
      scrub.vars.offset = snapped;
      scrub.invalidate().restart();
    };

    const step = (dir) => {
      scrub.vars.offset += dir * SPACING;
      scrub.invalidate().restart();
    };

    const onNext = () => step(1);
    const onPrev = () => step(-1);
    const nextEl = nextRef.current;
    const prevEl = prevRef.current;
    nextEl?.addEventListener('click', onNext);
    prevEl?.addEventListener('click', onPrev);

    /* ── drag / touch swiping ── */
    let startX = 0;
    const [draggable] = Draggable.create(proxy, {
      type: 'x',
      trigger: cardsEl,
      dragClickThreshold: 8,
      onPress() {
        this.startOffset = scrub.vars.offset;
        startX = this.x;
        isDraggingRef.current = false;
      },
      onDrag() {
        if (Math.abs(this.x - startX) > 5) {
          isDraggingRef.current = true;
        }
        scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.0018;
        scrub.invalidate().restart();
      },
      onDragEnd() {
        snapOffset();
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      },
    });

    return () => {
      nextEl?.removeEventListener('click', onNext);
      prevEl?.removeEventListener('click', onPrev);
      scrub.kill();
      loop.kill();
      draggable?.kill();
    };
  }, [products]);

  if (!products || !products.length) return null;

  const fallback = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600';
  
  // Duplicate list to fill at least 14 slots for smooth seamless continuous loop
  const cardItems = [];
  while (cardItems.length < 14) {
    cardItems.push(...products);
  }
  const sliced = cardItems.slice(0, Math.max(14, products.length * 2));

  return (
    <section ref={wrapRef} className="pc-wrapper relative w-full bg-[#09090b] text-white border-y border-zinc-800/90 overflow-hidden py-10 sm:py-16">
      
      {/* Background Ambience Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-zinc-700/10 rounded-full blur-[90px] pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="relative z-10 pc-header max-w-4xl mx-auto px-4 text-center space-y-2 mb-2 sm:mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md shadow-sm">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Interactive Showcase</span>
        </div>

        <h2 className="pc-title text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
          Browse Our Collection
        </h2>
        
        <p className="pc-sub text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium">
          Drag or swipe cards in 3D space &mdash; click any protector to explore full specifications
        </p>
      </div>

      {/* ── 3D Card Stage / Gallery ── */}
      <div className="relative z-10 pc-gallery">
        <ul ref={cardsRef} className="pc-cards">
          {sliced.map((product, i) => {
            const img = product.images?.[0] || fallback;
            const price = Number(product.price) || 640;
            const originalPrice = Number(product.original_price) || Math.round(price * 1.8);
            const categoryLabel = product.category 
              ? product.category.toUpperCase() 
              : '9H TEMPERED';

            return (
              <li
                key={`${product.id ?? i}-${i}`}
                onClick={() => goTo(product)}
                title={product.name}
                className="group select-none"
              >
                {/* Inner Card Container */}
                <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:border-emerald-500/50">
                  
                  {/* Card Background subtle gradient & glass tint */}
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/40 via-transparent to-black/90 pointer-events-none" />
                  
                  {/* Top Bar: Badge & Rating */}
                  <div className="relative z-10 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 bg-zinc-800/90 border border-zinc-700/80 text-emerald-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Shield className="w-2.5 h-2.5" />
                      {categoryLabel}
                    </span>
                    
                    <div className="inline-flex items-center gap-1 bg-black/60 border border-zinc-700/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-zinc-200">4.9</span>
                    </div>
                  </div>

                  {/* Centered Product Image Container */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-1.5 sm:my-2 overflow-hidden">
                    <div className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full max-h-[140px] sm:max-h-[180px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300 ease-out"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>

                  {/* Bottom Information Glass Banner */}
                  <div className="relative z-10 pt-2 border-t border-zinc-800/90 bg-zinc-950/70 -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 p-3 sm:p-3.5 backdrop-blur-sm">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1.5 pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-white">
                          ₹{price.toLocaleString()}
                        </span>
                        {originalPrice > price && (
                          <span className="text-[9px] sm:text-[10px] text-zinc-500 line-through">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                </div>
              </li>
            );
          })}
        </ul>

        {/* ── Carousel Step Controls & Navigation ── */}
        <div className="pc-actions">
          <button ref={prevRef} className="pc-btn group" aria-label="Previous Protector">
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Prev</span>
          </button>
          
          <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Drag to Rotate
          </div>

          <button ref={nextRef} className="pc-btn group" aria-label="Next Protector">
            <span>Next</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Invisible Draggable Proxy Target */}
      <div ref={proxyRef} style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }} />
    </section>
  );
}
