import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Phone, MessageSquare, ShieldCheck, Truck, RefreshCw, 
  Sparkles, Check, ArrowRight, Lock, ChevronDown, ChevronUp 
} from 'lucide-react';
import syncLogo from '../../assets/sync logo.PNG';
import { fetchCategories } from '../../utils/categoryStore';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Mobile accordion collapse states
  const [mobileAccordions, setMobileAccordions] = useState({
    shop: false,
    care: false,
    support: false
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Error fetching categories in Footer:', err);
      }
    }

    loadCategories();

    window.addEventListener('categories_updated', loadCategories);
    window.addEventListener('storage', loadCategories);
    return () => {
      window.removeEventListener('categories_updated', loadCategories);
      window.removeEventListener('storage', loadCategories);
    };
  }, []);

  const toggleAccordion = (key) => {
    setMobileAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-black text-zinc-300 border-t border-zinc-900 font-sans w-full overflow-hidden">
      
      {/* ── 1. Top Feature USP Strip ── */}
      <div className="border-b border-zinc-900 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7 lg:py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-zinc-950/80 border border-zinc-900/90 hover:border-zinc-800 transition-all duration-300 group">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">10-Sec Auto Align</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">Applicator tray included</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-zinc-950/80 border border-zinc-900/90 hover:border-zinc-800 transition-all duration-300 group">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">9H Diamond Hard</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">Shatterproof shield</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-zinc-950/80 border border-zinc-900/90 hover:border-zinc-800 transition-all duration-300 group">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">Free Express Delivery</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">On orders above ₹499</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-zinc-950/80 border border-zinc-900/90 hover:border-zinc-800 transition-all duration-300 group">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">100% Quality Assured</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">Genuine sync guarantee</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Area ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:py-20 sm:px-6 lg:px-8 bg-black">
        
        {/* Brand Info & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-8 md:pb-0">
          
          {/* Left: Brand Column (Laptop: 5 cols) */}
          <div className="md:col-span-5 space-y-6 lg:space-y-7">
            <Link to="/" className="inline-block transition-transform hover:opacity-95">
              <img
                src={syncLogo}
                alt="Sync Screen Guard"
                className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain brightness-110"
              />
            </Link>
            
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md font-normal">
              Engineered with molecularly reinforced 9H aluminosilicate glass and foolproof 10-second alignment applicators. Military-grade precision protection for your flagship smartphones and smartwatches.
            </p>

          

            {/* Laptop Trust Badge */}
            <div className="hidden md:flex items-center gap-2 text-zinc-400 text-xs font-medium pt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Genuine Sync Screen Guard • Direct Manufacturer Warranty</span>
            </div>
          </div>

          {/* ── Desktop/Laptop View Columns (md:grid 7 cols) ── */}
          <div className="hidden md:grid md:col-span-7 grid-cols-7 gap-6 lg:gap-8 pt-2">
            
            {/* Shop Categories (2 cols) - MAX 4 ADMIN CATEGORIES */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Shop Categories
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-400 font-medium">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id || cat.name}>
                    <Link
                      to={`/products?category=${encodeURIComponent(cat.id || cat.name)}`}
                      className="hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group"
                    >
                      <span className="text-zinc-600 group-hover:text-emerald-400 transition-colors">›</span>
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-zinc-500 italic">No categories loaded</li>
                )}
              </ul>
            </div>

            {/* Customer Care (2 cols) */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Customer Care
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-400 font-medium">
                <li>
                  <Link to="/about" className="hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group">
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">›</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group">
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">›</span>
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group">
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">›</span>
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-white hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1.5 group">
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">›</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Direct Support (3 cols) */}
            <div className="col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Direct Support
                </h3>
              </div>
              
              <div className="space-y-3 text-xs text-zinc-400">
                <a 
                  href="mailto:syncallfyp@gmail.com" 
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50 transition-all duration-200 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Email Us</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">syncallfyp@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="tel:+919846545949" 
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/50 transition-all duration-200 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Helpline Support</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">+91 98465 45949</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">(Mon - Sat, 10 AM - 7 PM)</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/919846545949?text=Hi%20Sync%20Screen%20Guard%2C%20I%20have%20an%20inquiry%20regarding%20screen%20protectors." 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-950/80 border border-emerald-900/50 hover:border-emerald-700/60 hover:bg-emerald-950/60 transition-all duration-200 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      WhatsApp Live Chat
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Click to chat directly</p>
                  </div>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* ── Mobile View Accordions (md:hidden) ── */}
        <div className="md:hidden space-y-2 pt-4 border-t border-zinc-900">
          
          {/* Mobile Accordion 1: Shop Categories */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden">
            <button
              onClick={() => toggleAccordion('shop')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
            >
              <span>Shop Categories</span>
              {mobileAccordions.shop ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>
            {mobileAccordions.shop && (
              <div className="px-4 pb-3.5 space-y-2 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2.5">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id || cat.name}
                    to={`/products?category=${encodeURIComponent(cat.id || cat.name)}`}
                    className="block py-1 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Accordion 2: Customer Care */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden">
            <button
              onClick={() => toggleAccordion('care')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
            >
              <span>Customer Care</span>
              {mobileAccordions.care ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>
            {mobileAccordions.care && (
              <div className="px-4 pb-3.5 space-y-2 text-xs text-zinc-400 border-t border-zinc-800/60 pt-2.5">
                <Link to="/about" className="block py-1 hover:text-white transition-colors">About Us</Link>
                <Link to="/contact" className="block py-1 hover:text-white transition-colors">Contact Us</Link>
                <Link to="/terms" className="block py-1 hover:text-white transition-colors">Terms & Conditions</Link>
                <Link to="/privacy-policy" className="block py-1 hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            )}
          </div>

          {/* Mobile Quick Tap-To-Connect Buttons */}
          <div className="pt-2 grid grid-cols-3 gap-2">
            <a
              href="tel:+919846545949"
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider active:bg-zinc-900 transition-colors text-center"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call</span>
            </a>
            <a
              href="https://wa.me/919846545949?text=Hi%20Sync%20Screen%20Guard%20Support%2C%20I%20have%20a%20query."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-300 text-[11px] font-bold uppercase tracking-wider active:bg-emerald-900 transition-colors text-center"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
            <a
              href="mailto:syncallfyp@gmail.com"
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider active:bg-zinc-900 transition-colors text-center"
            >
              <Mail className="h-3.5 w-3.5 text-emerald-400" />
              <span>Email</span>
            </a>
          </div>

          {/* Mobile Trust Chip */}
          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
              <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted Checkout
            </span>
          </div>

        </div>

        {/* ── 3. Bottom Bar: Copyright & Payment Badges ── */}
        <div className="mt-10 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} Sync Screen Guard. All rights reserved.
          </p>

         
        </div>

      </div>
    </footer>
  );
}
