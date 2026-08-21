import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Zap, RefreshCw, ShoppingCart, Star, 
  Sparkles, ArrowRight, Lock, Eye, Droplets, 
  Play, Truck, ChevronDown, CheckCircle2
} from "lucide-react";
import useCart from "../hooks/useCart";
import { supabase } from "../supabaseClient";
import ProductCard from "../components/product/ProductCard";

const normalizeColor = (c) => {
  const map = {
    blue: "#0ea5e9", orange: "#f59e0b", pink: "#db2777", 
    green: "#10b981", purple: "#8b5cf6", cyan: "#06b6d4"
  };
  if (!c) return "#0ea5e9";
  if (c.startsWith("#")) return c;
  return map[c.toLowerCase()] || "#0ea5e9";
};

const SpecIcon = ({ type, color }) => {
  const props = { className: "w-5 h-5", style: { color } };
  if (type === "sparkle") return <Sparkles {...props} />;
  if (type === "zap") return <Zap {...props} />;
  if (type === "lock") return <Lock {...props} />;
  if (type === "eye") return <Eye {...props} />;
  if (type === "droplet") return <Droplets {...props} />;
  return <ShieldCheck {...props} />;
};

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [curIdx, setCurIdx] = useState(0);
  const [addedMap, setAddedMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function load() {
      const { data: db } = await supabase.from("products").select("*");
      const mapped = (db || []).map(p => ({
        ...p,
        accentColor: normalizeColor(p.theme_color),
        tagline: p.tagline || "Optical grade protection.",
        specs: p.specs || [
          { title: "9H Hardness", icon: "shield" },
          { title: "EZ Fit Tray", icon: "zap" },
          { title: "HD Clarity", icon: "eye" }
        ]
      }));
      setProducts(mapped.length > 0 ? mapped : FALLBACK_DEMO_DATA);
    }
    load();
  }, []);

  const currentProduct = products[curIdx] || FALLBACK_DEMO_DATA[0];

  const handleAddToCart = (prod, e) => {
    if (e) e.stopPropagation();
    addToCart(prod, 1);
    setAddedMap(prev => ({ ...prev, [prod.id]: true }));
    setTimeout(() => setAddedMap(prev => ({ ...prev, [prod.id]: false })), 2000);
  };

  const handleBuyNow = (prod, e) => {
    if (e) e.stopPropagation();
    addToCart(prod, 1);
    navigate('/checkout');
  };

  return (
    <div className="relative w-full min-h-screen bg-sky-100 text-sky-950 font-sans selection:bg-sky-300 selection:text-sky-900">
      
      {/* ── NO-WHITE ATMOSPHERIC BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[100px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-sky-400/20 blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col space-y-24 sm:space-y-36 pb-32">
        
        {/* ── 1. HERO SECTION (CYAN MONOCHROME) ── */}
        <section className="pt-32 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-200/60 backdrop-blur-xl border border-sky-300 shadow-inner"
              >
                <Lock className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-sky-700">28° Micro-Louver Privacy Armor</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-sky-900 leading-[1.18] py-2"
              >
                Sync <span className="text-cyan-600 italic font-medium">Privacy</span>
                <br className="my-2" />
                <span className="text-blue-600 font-extrabold underline decoration-sky-300">Glass.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="max-w-xl text-base sm:text-lg text-sky-900/80 leading-[1.8] font-semibold pt-2"
              >
                Shield your screen from unwanted eyes. Engineered with advanced 28° micro-louver optical technology, Sync Privacy Glass darkens your display for side onlookers while maintaining 100% HD clarity for you. Includes our dust-absorbing EZ Fit tray for automatic, bubble-free installation in seconds.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <button 
                  onClick={(e) => handleBuyNow(currentProduct, e)}
                  className="px-8 py-4.5 bg-sky-600 text-sky-50 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-400/40 hover:bg-sky-700 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now — ₹{currentProduct.price}</span>
                </button>
                <button 
                  onClick={(e) => handleAddToCart(currentProduct, e)}
                  className="px-8 py-4.5 bg-sky-200/50 backdrop-blur-md border border-sky-400/30 text-sky-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-300/50 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-sky-700" />
                  <span>{addedMap[currentProduct.id] ? "Added to Cart!" : "Add to Cart"}</span>
                </button>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] bg-sky-300/30 backdrop-blur-3xl rounded-[48px] overflow-hidden border border-sky-400/40 shadow-2xl shadow-sky-400/20 group p-2">
                <div className="w-full h-full rounded-[40px] overflow-hidden bg-gradient-to-b from-cyan-100 to-sky-200 relative">
                  <img 
                    src={currentProduct.images[0]} 
                    className="w-full h-full object-cover mix-blend-multiply opacity-80"
                    alt="Product"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-300/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-10 left-10 text-sky-900">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-sky-600">Series Alpha</p>
                   <h3 className="text-2xl font-bold">{currentProduct.name}</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 2. TRUST BLOCKS (BLUE GLASS) ── */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Sky-Link Shipping", desc: "Global fulfillment via our high-speed blue network." },
              { icon: ShieldCheck, title: "Ion-Blue Hardness", desc: "Tempered at 400°C for absolute scratch immunity." },
              { icon: RefreshCw, title: "Zero-Bubble Sync", desc: "Vacuum-sealed tray ensures a perfect bond." }
            ].map((f, i) => (
              <div key={i} className="bg-sky-200/40 backdrop-blur-xl border border-sky-300/50 p-10 rounded-[40px] space-y-4 hover:bg-sky-300/40 transition-all group">
                <div className="w-14 h-14 flex items-center justify-center bg-sky-500 rounded-2xl shadow-lg shadow-sky-400/30">
                  <f.icon className="w-7 h-7 text-sky-50" />
                </div>
                <h3 className="text-xl font-black text-sky-900">{f.title}</h3>
                <p className="text-sky-800/70 font-bold leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. PRODUCT CATALOG (DEEP BLUE GRID) ── */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-sky-900 tracking-tighter uppercase">The Lab</h2>
              <p className="text-sky-700 font-bold">Sort by molecular structure.</p>
            </div>
            <div className="flex bg-sky-200/60 p-2 rounded-3xl border border-sky-300">
              {["all", "glass", "privacy"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${selectedCategory === cat ? 'bg-sky-600 text-sky-50 shadow-lg' : 'text-sky-500 hover:text-sky-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 items-stretch">
            {products
              .filter(p => selectedCategory === 'all' || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())))
              .map((p) => (
                <ProductCard 
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  isAdded={!!addedMap[p.id]}
                />
            ))}
          </div>
        </section>

        {/* ── 4. TECH SECTION (DEEP OCEAN) ── */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-sky-800 to-blue-950 rounded-[70px] p-12 lg:p-24 overflow-hidden relative border border-sky-500/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                <span className="text-cyan-400 font-black uppercase tracking-[0.5em] text-[10px]">Neural-Tray Tech</span>
                <h2 className="text-6xl sm:text-8xl font-black text-sky-50 leading-[0.8] tracking-tighter">
                  Blue <br /> Motion.
                </h2>
                <p className="text-sky-300/70 text-lg font-bold leading-relaxed max-w-sm">
                  Our custom-tuned cyan adhesive layer ensures zero light-refraction, keeping your display's blue-light filters working perfectly.
                </p>
                <div className="flex gap-4">
                   <div className="px-6 py-4 bg-sky-500/20 border border-sky-400/40 rounded-3xl">
                      <p className="text-2xl font-black text-sky-100">0.03mm</p>
                      <p className="text-[10px] uppercase font-black text-sky-400">Tolerance</p>
                   </div>
                   <div className="px-6 py-4 bg-sky-500/20 border border-sky-400/40 rounded-3xl">
                      <p className="text-2xl font-black text-sky-100">100%</p>
                      <p className="text-[10px] uppercase font-black text-sky-400">Response</p>
                   </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-sky-500/20 blur-3xl group-hover:bg-cyan-500/30 transition-all" />
                <img 
                  src="https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=800" 
                  className="relative rounded-[50px] shadow-3xl border border-sky-400/30 grayscale contrast-125 brightness-75 group-hover:grayscale-0 transition-all duration-700"
                  alt="Installation"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. FINAL CTA (CYAN GRADIENT) ── */}
        <section className="px-6 max-w-7xl mx-auto w-full">
          <div className="bg-sky-300/40 backdrop-blur-3xl border border-sky-400/40 rounded-[60px] p-16 sm:p-28 text-center relative overflow-hidden shadow-2xl shadow-sky-400/30">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-400/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 space-y-12">
              <h2 className="text-6xl sm:text-8xl font-black text-sky-950 tracking-tighter uppercase leading-none">Initialize <br /> Your Shield.</h2>
              <p className="text-sky-800 font-black text-xl max-w-xl mx-auto">
                No white backgrounds. No standard designs. Just pure, blue-tinted perfection for your smartphone.
              </p>
              <button className="px-16 py-7 bg-sky-900 text-sky-50 rounded-[30px] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-sky-950 hover:scale-105 transition-all shadow-2xl shadow-sky-900/40">
                Unlock 20% Discount
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

const FALLBACK_DEMO_DATA = [
  {
    id: "1",
    name: "Sync EZ Crystal",
    category: "Clear",
    price: 649,
    theme_color: "blue",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800"],
    specs: [{ title: "HD Clarity", icon: "eye" }, { title: "EZ Tray", icon: "zap" }]
  },
  {
    id: "2",
    name: "Privacy Stealth",
    category: "Privacy",
    price: 799,
    theme_color: "cyan",
    images: ["https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=800"],
    specs: [{ title: "28° Angle", icon: "lock" }, { title: "Anti-Oil", icon: "droplet" }]
  },
  {
    id: "3",
    name: "Diamond Matte",
    category: "Matte",
    price: 899,
    theme_color: "indigo",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=800"],
    specs: [{ title: "Zero Glare", icon: "sparkle" }, { title: "9H Armor", icon: "shield" }]
  }
];