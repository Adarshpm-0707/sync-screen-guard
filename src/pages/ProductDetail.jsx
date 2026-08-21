import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGallery from '../components/product/ProductGallery';
import { 
  Check, ShieldCheck, Star, ChevronRight, ShoppingBag, 
  Zap, ArrowLeft, Truck, Smartphone, Cpu, 
  Sparkles, RefreshCw, Layers 
} from 'lucide-react';
import useCart from '../hooks/useCart';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '../constants/models';

export default function ProductDetail({ product: propProduct }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || propProduct;

  const [quantity, setQuantity] = useState(1);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedModel);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedModel);
    navigate('/cart');
  };

  return (
    <div className="relative w-full min-h-screen bg-sky-100 text-sky-950 font-sans selection:bg-sky-300 overflow-hidden">
      
      {/* ── ATMOSPHERIC SKY BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-200/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-300/40 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-28 space-y-10"
      >
        {/* Navigation Breadcrumb: Frosted Style */}
        <nav className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-sky-700/60">
          <Link to="/" className="hover:text-sky-900 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <Link to="/products" className="hover:text-sky-900 transition-colors">Lab Catalog</Link>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="text-sky-900 truncate max-w-[150px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Panel: Ice-Box Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-32">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative bg-sky-200/30 backdrop-blur-3xl rounded-[50px] border border-sky-300/40 p-6 shadow-2xl shadow-sky-400/20 overflow-hidden"
            >
              <div className="absolute top-8 left-8 z-20 px-4 py-1.5 rounded-full bg-sky-600 text-sky-50 text-[9px] font-black uppercase tracking-widest shadow-lg">
                Series: Ion-Armor
              </div>
              <div className="relative z-10 p-4">
                <ProductGallery images={product.images} />
              </div>
              {/* Abstract decoration */}
              <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-cyan-400/10 blur-[80px] rounded-full" />
            </motion.div>
          </div>

          {/* Right Panel: Feature Data Interface */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-6 bg-sky-200/20 backdrop-blur-3xl rounded-[50px] border border-sky-300/30 p-8 sm:p-12 space-y-10 shadow-xl shadow-sky-400/10"
          >
            {/* Holographic Product Header */}
            <header className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-black tracking-[0.2em] text-sky-50 bg-sky-600 px-4 py-2 rounded-2xl shadow-md uppercase">
                  Tray System Alpha
                </span>
                <span className="text-[9px] font-black tracking-[0.2em] text-sky-700 bg-sky-300/40 border border-sky-400/30 px-4 py-2 rounded-2xl uppercase">
                  Available: {product.stock || 100} units
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-sky-950 tracking-tighter leading-[0.9] uppercase">
                {product.name}
              </h1>

              <div className="flex items-center space-x-3">
                <div className="flex text-sky-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="text-[10px] text-sky-800 font-black uppercase tracking-widest opacity-60">Verified Signal (4.9/5)</span>
              </div>
            </header>

            {/* Price Node */}
            <div className="bg-sky-300/30 border border-sky-400/20 rounded-[32px] p-8 space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-light text-sky-950 tracking-tighter">₹{product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-sky-600/50 line-through font-medium">₹{product.original_price}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-sky-700 uppercase tracking-widest pt-2 border-t border-sky-400/20">
                <Truck className="h-4 w-4" />
                <span>Priority Logistics Activated. No Delivery Cost.</span>
              </div>
            </div>

            {/* Device Matrix Selector */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Device Port
                </label>
                <span className="text-[10px] font-black text-sky-900">{selectedModel}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                      selectedModel === model
                        ? 'bg-sky-900 text-sky-100 border-sky-950 shadow-xl scale-105'
                        : 'bg-sky-300/20 text-sky-700 border-sky-400/20 hover:bg-sky-300/40'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </section>

            {/* Tactical Action Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between bg-sky-300/20 p-2 rounded-[24px] border border-sky-400/20">
                <span className="pl-6 text-[10px] font-black text-sky-700 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center space-x-4 bg-sky-900 rounded-[20px] p-2 text-sky-100">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center font-black hover:text-cyan-300 transition-colors">-</button>
                  <span className="text-sm font-black w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="h-10 w-10 flex items-center justify-center font-black hover:text-cyan-300 transition-colors">+</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="group py-6 rounded-[28px] border border-sky-400/40 bg-sky-300/10 hover:bg-sky-300/30 text-[10px] font-black text-sky-950 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="h-4 w-4 text-sky-600 group-hover:scale-110 transition-transform" />
                  {isAdded ? 'Synced' : 'Add to System'}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="py-6 rounded-[28px] bg-sky-600 hover:bg-sky-700 text-sky-50 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-sky-400/40 transition-all flex items-center justify-center gap-3"
                >
                  <Zap className="h-4 w-4 fill-sky-50" />
                  Instant Deployment
                </button>
              </div>
            </section>

            {/* Quality Signal Bar */}
            <div className="flex items-center gap-6 p-6 rounded-[32px] bg-sky-900 border border-sky-400/30 text-sky-100 shadow-xl">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest">Structural Guarantee</h4>
                <p className="text-[11px] text-sky-400 mt-1 font-bold">100% Optical precision or immediate swap.</p>
              </div>
            </div>

            {/* Interface Tabs: Information Layers */}
            <section className="space-y-6">
              <div className="flex gap-8 border-b border-sky-400/20 text-[9px] font-black uppercase tracking-[0.2em] text-sky-700/60">
                {['description', 'specs', 'reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 relative transition-colors ${activeTab === tab ? 'text-sky-950' : 'hover:text-sky-900'}`}
                  >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600" />}
                  </button>
                ))}
              </div>

              <div className="text-sm font-bold text-sky-800/70 leading-relaxed min-h-[100px]">
                {activeTab === 'description' && (
                  <p>{product.description || 'Molecularly bonded 9H tempered glass optimized for pixel-perfect clarity. The integrated SkyTray alignment sequence eliminates human error during installation.'}</p>
                )}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-y-4 text-[11px] uppercase tracking-wider">
                    <span className="text-sky-500">Atomic Hardness</span><span className="text-sky-950 text-right">9H Grade</span>
                    <span className="text-sky-500">Light Passage</span><span className="text-sky-950 text-right">99.9% HD</span>
                    <span className="text-sky-500">Core Element</span><span className="text-sky-950 text-right">Alumino-silicate</span>
                    <span className="text-sky-500">Bonding Method</span><span className="text-sky-950 text-right">Static-Suction</span>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-sky-300/20 rounded-2xl border border-sky-400/20">
                      <div className="flex justify-between text-[10px] uppercase font-black mb-2 text-sky-900">
                        <span>A. Verma</span>
                        <span className="text-sky-500">★★★★★</span>
                      </div>
                      <p className="text-xs italic leading-snug">"Zero friction on the glass. The installation tray was flawlessly aligned."</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}