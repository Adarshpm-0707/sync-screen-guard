import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, ShoppingBag, Truck, User, LogOut, 
  ShieldCheck, ChevronRight, ChevronDown, Sparkles, Phone, Mail, Lock, Layers, ArrowRight
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import syncLogo from '../../assets/sync-logo.png';
import { fetchCategories } from '../../utils/categoryStore';
import { fetchStoreProducts, getInstantProducts } from '../../utils/productStore';

export default function MobileMenu({ isOpen, onClose, customer, onOpenAuth, onLogout }) {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(() => getInstantProducts());
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchStoreProducts()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const customerEmail = customer?.email || '';
  const customerInitial = customerEmail ? customerEmail.charAt(0).toUpperCase() : '';
  const customerDisplayName = customerEmail.includes('@') ? customerEmail.split('@')[0] : customerEmail;

  const handleProductClick = (prod) => {
    onClose();
    navigate('/product', { state: { product: prod } });
  };

  const getCategoryProducts = (catId) => {
    const cid = (catId || '').toLowerCase();
    const matched = products.filter(p => {
      const pCat = (p.category || 'glass').toLowerCase();
      if (pCat === cid) return true;
      if (cid === 'sparkle' && pCat === 'matte') return true;
      if (cid === 'matte' && pCat === 'sparkle') return true;
      const fullText = `${p.name || ''} ${p.description || ''}`.toLowerCase();
      if (cid === 'camera' && fullText.includes('camera')) return true;
      if (cid === 'watch' && (fullText.includes('watch') || fullText.includes('iwatch'))) return true;
      if (cid === 'privacy' && fullText.includes('privacy')) return true;
      return false;
    });
    return matched.length > 0 ? matched : products.slice(0, 3);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Luxury Dark Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[320px] max-w-[88vw] bg-[#09090b] text-white p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-white/10"
          >
            <div className="space-y-5">
              {/* Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <Link to="/" onClick={onClose} title="Sync Screen Guard" aria-label="Sync Screen Guard" className="flex items-center space-x-2">
                  <img
                    src={syncLogo}
                    alt="Sync Screen Guard"
                    className="h-9 w-auto object-contain"
                  />
             
                </Link>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Account Section Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md">
                {customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 font-bold text-xs shadow-md ring-2 ring-emerald-500/30">
                        {customerInitial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{customerDisplayName}</p>
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active Account
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
                      <Link
                        to="/tracking"
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-black/60 border border-zinc-800 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Truck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>My Orders & Tracking</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                      </Link>
                      
                      <button
                        onClick={() => {
                          onClose();
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/30 border border-rose-900/30 hover:bg-rose-950/60 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-400">Sign in to track your orders and enjoy fast checkout.</p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenAuth) onOpenAuth();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In / Register</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Navigation Links */}
              <nav className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 mb-1">Navigation</p>
                {[
                  { to: '/', label: 'Home', icon: Home },
                  { to: '/products', label: 'All Products', icon: ShoppingBag },
            
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all text-xs font-bold uppercase tracking-wider border border-transparent hover:border-zinc-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-emerald-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600" />
                    </Link>
                  );
                })}
              </nav>

              {/* Browse by Category & Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Categories & Protectors</p>
                  <span className="text-[9px] font-bold text-emerald-400">{categories.length} Categories</span>
                </div>

                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isExpanded = expandedCat === cat.id;
                    const catProds = getCategoryProducts(cat.id);

                    return (
                      <div key={cat.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                          className="w-full flex items-center justify-between p-3 text-left cursor-pointer hover:bg-zinc-800/60 transition-colors"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-200">{cat.name}</span>
                            <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-950 px-1.5 py-0.2 rounded-md">
                              {catProds.length}
                            </span>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180 text-emerald-400' : ''}`} />
                        </button>

                        {/* Expandable Product List */}
                        {isExpanded && (
                          <div className="p-2.5 bg-zinc-950/80 border-t border-zinc-800/80 space-y-2">
                            {catProds.slice(0, 4).map((p) => {
                              const pPrice = Number(p.price) || 640;
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => handleProductClick(p)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 cursor-pointer group"
                                >
                                  <div className="h-10 w-10 rounded-lg bg-zinc-950 p-1 flex items-center justify-center shrink-0">
                                    <img
                                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'}
                                      alt={p.name}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-zinc-200 group-hover:text-white truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] font-black text-emerald-400 mt-0.5">
                                      ₹{pPrice.toLocaleString()}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 shrink-0" />
                                </div>
                              );
                            })}

                            <Link
                              to={`/products?category=${encodeURIComponent(cat.id)}`}
                              onClick={onClose}
                              className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 rounded-xl border border-emerald-900/40"
                            >
                              <span>View All {cat.name}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Info & Trust Badge */}
            <div className="mt-6 space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2.5 text-[11px] text-emerald-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>10-Sec Auto Alignment Box Included</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-400" /> 256-Bit SSL Secured
                </span>
                <span>© {new Date().getFullYear()} Sync</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

