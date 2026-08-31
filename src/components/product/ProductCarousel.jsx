import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(Draggable);

/* ─────────────────────────────────────────────────────────
   buildSeamlessLoop — exact port of the CodePen helper.
   Builds a gsap.timeline that scrubs a raw sequence so it
   appears to loop seamlessly in either direction.
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
      // edge-case fix from the original CodePen (GSAP 3.6.1+)
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

/* ─────────────────────────────────────────────────────────
   ProductCarousel
   • Auto-plays via gsap.ticker (no ScrollTrigger needed)
   • Prev / Next buttons step between cards
   • Drag on the card deck to scrub freely
───────────────────────────────────────────────────────── */
export default function ProductCarousel({ products = [] }) {
  const navigate  = useNavigate();
  const wrapRef   = useRef(null);   // outer wrapper
  const cardsRef  = useRef(null);   // <ul> with the <li> cards
  const proxyRef  = useRef(null);   // invisible Draggable target
  const prevRef   = useRef(null);
  const nextRef   = useRef(null);

  const goTo = useCallback(
    (product) => navigate('/product', { state: { product } }),
    [navigate],
  );

  useEffect(() => {
    const cardsEl = cardsRef.current;
    const proxy   = proxyRef.current;
    if (!cardsEl || !proxy) return;

    const cardEls = Array.from(cardsEl.querySelectorAll('li'));
    if (!cardEls.length) return;

    const SPACING  = 0.1;                           // seconds between each card in the loop
    const snapTime = gsap.utils.snap(SPACING);

    /* ── initial invisible state (same as CodePen) ── */
    gsap.set(cardEls, { xPercent: 400, opacity: 0, scale: 0 });

    /* ── per-card animation (same as CodePen) ── */
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

    const loop     = buildSeamlessLoop(cardEls, SPACING, animateFunc);
    const duration = loop.duration();
    const wrapTime = gsap.utils.wrap(0, duration);

    /* ── playhead proxy ── */
    const playhead = { offset: 0 };

    /* ── smooth scrub tween (reused, like the CodePen) ── */
    const scrub = gsap.to(playhead, {
      offset: 0,
      onUpdate() { loop.time(wrapTime(playhead.offset)); },
      duration: 0.5,
      ease: 'power3',
      paused: true,
    });

    /* ── snap to nearest card ── */
    const snapOffset = () => {
      const snapped = snapTime(scrub.vars.offset);
      scrub.vars.offset = snapped;
      scrub.invalidate().restart();
    };

    /* ── step helpers (buttons) ── */
    const step = (dir) => {
      scrub.vars.offset += dir * SPACING;
      scrub.invalidate().restart();
    };

    /* ── button listeners ── */
    const onNext = () => step(1);
    const onPrev = () => step(-1);
    const nextEl = nextRef.current;
    const prevEl = prevRef.current;
    nextEl?.addEventListener('click', onNext);
    prevEl?.addEventListener('click', onPrev);

    /* ── drag ── */
    const [draggable] = Draggable.create(proxy, {
      type: 'x',
      trigger: cardsEl,
      onPress() {
        this.startOffset = scrub.vars.offset;
      },
      onDrag() {
        scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.0015;
        scrub.invalidate().restart();
      },
      onDragEnd() {
        snapOffset();
      },
    });

    /* ── cleanup ── */
    return () => {
      nextEl?.removeEventListener('click', onNext);
      prevEl?.removeEventListener('click', onPrev);
      scrub.kill();
      loop.kill();
      draggable?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  if (!products.length) return null;

  const fallback  = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600';
  // Duplicate list to fill at least 14 slots — needed for a rich seamless loop
  const cardItems = [];
  while (cardItems.length < 14) {
    cardItems.push(...products);
  }
  const sliced = cardItems.slice(0, Math.max(14, products.length * 2));

  return (
    <div ref={wrapRef} className="pc-wrapper">
      {/* ── Header ── */}
      <div className="pc-header">
        <span className="pc-badge">Featured</span>
        <h2 className="pc-title">Browse Our Collection</h2>
        <p className="pc-sub">Drag or tap the arrows to explore — click any card to view</p>
      </div>

      {/* ── Gallery ── */}
      <div className="pc-gallery">
        <ul ref={cardsRef} className="pc-cards">
          {sliced.map((product, i) => {
            const img = product.images?.[0] || fallback;
            return (
              <li
                key={`${product.id ?? i}-${i}`}
                style={{ backgroundImage: `url(${img})` }}
                onClick={() => goTo(product)}
                title={product.name}
              >
                <div className="pc-card-info">
                  <span className="pc-card-name">{product.name}</span>
                  <span className="pc-card-price">
                    &#8377;{Number(product.price || 0).toLocaleString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── Controls ── */}
        <div className="pc-actions">
          <button ref={prevRef} className="pc-btn" aria-label="Previous">
            <ChevronLeft size={16} />
            Prev
          </button>
          <button ref={nextRef} className="pc-btn" aria-label="Next">
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* invisible drag proxy */}
      <div ref={proxyRef} style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }} />
    </div>
  );
}
