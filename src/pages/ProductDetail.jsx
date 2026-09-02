import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/product/ProductCard';
import { 
  Check, ShieldCheck, Star, ChevronRight, ShoppingBag, 
  Zap, ArrowLeft, Truck, Smartphone, Sparkles, RefreshCw, 
  Layers, Lock, MapPin, ChevronDown, ChevronUp, PackageCheck 
} from 'lucide-react';
import useCart from '../hooks/useCart';
import useCustomerAuth from '../hooks/useCustomerAuth';
import useStoreSettings from '../hooks/useStoreSettings';
import { 
  fetchStoreProducts, 
  getInstantProducts,
  DEFAULT_SPECIFICATIONS,
  DEFAULT_INSTALLATION_GUIDE,
  DEFAULT_BOX_CONTENTS
} from '../utils/productStore';

export default function ProductDetail({ product: propProduct }) {
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const { settings: storeSettings } = useStoreSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(() => {
    return location.state?.product || propProduct || getInstantProducts()[0] || null;
  });
  const [allProducts, setAllProducts] = useState(() => getInstantProducts());

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Accordion open/close state
  const [openAccordion, setOpenAccordion] = useState('desc');

  // Parsers for custom accordion content
  const parsedSpecs = useMemo(() => {
    const raw = product?.specifications || DEFAULT_SPECIFICATIONS;
    if (!raw) return [];
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          return {
            label: line.substring(0, colonIdx).trim(),
            value: line.substring(colonIdx + 1).trim(),
          };
        }
        return { label: null, value: line.replace(/^[•\-\*]\s*/, '').trim() };
      });
  }, [product?.specifications]);

  const parsedSteps = useMemo(() => {
    const raw = product?.installation_guide || DEFAULT_INSTALLATION_GUIDE;
    if (!raw) return [];
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const clean = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
        return { num: idx + 1, text: clean || line };
      });
  }, [product?.installation_guide]);

  const parsedBoxItems = useMemo(() => {
    const raw = product?.box_contents || DEFAULT_BOX_CONTENTS;
    if (!raw) return [];
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[•\-\*]\s*/, '').trim());
  }, [product?.box_contents]);

  useEffect(() => {
    fetchStoreProducts().then(items => {
      setAllProducts(items || []);
      if (!product && items && items.length > 0) {
        setProduct(items[0]);
      }
    });
  }, [product]);

  // Update selected product when route state changes
  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      window.scrollTo(0, 0);
    }
  }, [location.state]);

  if (!product) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center bg-[#FAFAFA] px-4 text-center">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 max-w-md w-full space-y-4 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-zinc-400 mx-auto" />
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 uppercase">Product Not Found</h2>
          <p className="text-xs text-zinc-500 font-medium">Please browse our collection to select a screen protector.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      const days = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Monday'];
      const randomDay = days[Math.floor(Math.random() * days.length)];
      const codText = storeSettings?.cod_enabled !== false 
        ? `COD Available${Number(storeSettings?.cod_fee) > 0 ? ` (+₹${storeSettings.cod_fee})` : ' (Free COD)'}` 
        : 'Prepaid Only';
      setPincodeResult({
        success: true,
        message: `Express Delivery by ${randomDay} • ${codText}`
      });
    } else {
      setPincodeResult({
        success: false,
        message: 'Please enter a valid 6-digit postal pincode'
      });
    }
  };


  const price = Number(product.price) || 640;
  const originalPrice = Number(product.original_price) || Math.round(price * 1.8);
  const discountPercent = originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 font-sans w-full">
      
      {/* ── 1. Breadcrumbs Navigation ── */}
      <div className="border-b border-zinc-200/80 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider overflow-hidden truncate">
            <Link to="/" className="hover:text-zinc-900 transition-colors shrink-0">Home</Link>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <Link to="/products" className="hover:text-zinc-900 transition-colors shrink-0">Catalog</Link>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="text-zinc-900 truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── 2. Main PDP Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Gallery (7 Cols on Desktop) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 w-full">
            <ProductGallery images={product.images} />
          </div>

          {/* Right Column: Product Actions & Details (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 w-full">
            
            {/* Header: Badges, Title, Ratings */}
            <div className="space-y-2.5 sm:space-y-3 pb-4 sm:pb-5 border-b border-zinc-200/80">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {product.is_best_seller && (
                  <span className="rounded bg-zinc-900 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white">
                    🔥 BESTSELLER
                  </span>
                )}
                <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                  9H Tempered Glass
                </span>
                <span className="rounded bg-zinc-100 text-zinc-700 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  Auto-Align Tray Included
                </span>
              </div>

              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-zinc-900">4.9</span>
                <span className="text-zinc-400">(240+ Reviews)</span>
              </div>

              {/* Pricing Section */}
              <div className="flex items-baseline gap-2.5 sm:gap-3 pt-1 flex-wrap">
                <span className="font-display text-2xl sm:text-3xl font-black text-zinc-900">
                  ₹{price.toLocaleString()}
                </span>
                {originalPrice > price && (
                  <>
                    <span className="text-xs sm:text-sm text-zinc-400 line-through font-medium">
                      MRP ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="rounded-full bg-emerald-600 text-white px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                      Save ₹{(originalPrice - price).toLocaleString()} ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">Inclusive of all taxes. Free shipping on prepaid orders.</p>

              {/* Product Description */}
              {product.description && (
                <div className="pt-3.5 border-t border-zinc-200/70">
                  <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quantity Controller & CTA Buttons */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Quantity */}
                <div className="flex items-center rounded-xl border border-zinc-300 bg-white p-1 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-zinc-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-98'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now CTA */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-800">
                <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                <span>Check Delivery & Cash on Delivery</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 rounded-xl bg-white border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer shrink-0"
                >
                  Check
                </button>
              </form>
              {pincodeResult && (
                <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                  pincodeResult.success ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {pincodeResult.success && <Truck className="h-3.5 w-3.5 shrink-0" />}
                  <span>{pincodeResult.message}</span>
                </p>
              )}
            </div>

            {/* Guarantee Pills */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-800">9H Shatterproof</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-200 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-800">100% Quality Assured</span>
              </div>
            </div>

            {/* ── 3. Expandable Spec & Installation Accordions ── */}
            <div className="border-t border-zinc-200/80 pt-4 sm:pt-6 space-y-2.5 sm:space-y-3">
              
              {/* Accordion 0: Overview & Highlights */}
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                >
                  <span>Overview & Key Highlights</span>
                  {openAccordion === 'desc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === 'desc' && (
                  <div className="px-3.5 sm:px-4 pb-4 text-xs sm:text-sm text-zinc-600 border-t border-zinc-100 pt-3 leading-relaxed whitespace-pre-line">
                    <p>{product.description || 'Flagship 9H tempered glass featuring revolutionary auto-alignment box applicator. Dust-free, bubble-free 10-second installation with oleophobic anti-fingerprint coating.'}</p>
                  </div>
                )}
              </div>

              {/* Accordion 1: Specifications */}
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                >
                  <span>Product Specifications</span>
                  {openAccordion === 'specs' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === 'specs' && (
                  <div className="px-3.5 sm:px-4 pb-4 text-xs text-zinc-600 space-y-2 border-t border-zinc-100 pt-3">
                    {parsedSpecs.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                        {item.label ? (
                          <>
                            <span className="font-bold text-zinc-800 shrink-0">{item.label}:</span>
                            <span className="text-zinc-600">{item.value}</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                            <span>{item.value}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 2: 10-Second Installation Steps */}
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'install' ? null : 'install')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                >
                  <span>10-Second Installation Guide</span>
                  {openAccordion === 'install' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === 'install' && (
                  <div className="px-3.5 sm:px-4 pb-4 text-xs text-zinc-600 space-y-2.5 border-t border-zinc-100 pt-3">
                    {parsedSteps.map((step) => (
                      <div key={step.num} className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white text-[10px] font-bold shrink-0 mt-0.5">
                          {step.num}
                        </span>
                        <p className="leading-relaxed flex-1">{step.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 3: What's In The Box */}
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'box' ? null : 'box')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                >
                  <span>What's In The Box</span>
                  {openAccordion === 'box' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === 'box' && (
                  <div className="px-3.5 sm:px-4 pb-4 text-xs text-zinc-600 space-y-2 border-t border-zinc-100 pt-3">
                    {parsedBoxItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <p className="font-medium text-zinc-700">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ── 4. Related Products Recommendation Carousel ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-zinc-200">
            <h2 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-zinc-900 mb-4 sm:mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 max-w-md sm:max-w-none mx-auto">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={() => addToCart(p, 1)}
                  isAdded={false}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}