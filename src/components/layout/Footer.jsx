import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Phone, ShieldCheck, Truck, RefreshCw, 
  Sparkles, Check, ArrowRight, Lock 
} from 'lucide-react';
import syncLogo from '../../assets/sync logo.PNG';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 font-sans w-full overflow-hidden">
      {/* ── 1. Top Feature USP Strip ── */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">10-Sec Auto Align</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Applicator tray included</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">9H Diamond Hard</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Shatterproof shield</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">Free Express Delivery</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">On orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">7-Day Replacement</h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Zero hassle guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Grid & Newsletter ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-12">
          
          {/* Brand Info & Newsletter (5 Columns) */}
          <div className="md:col-span-5 space-y-4 sm:space-y-6">
            <Link to="/" className="inline-block">
              <img
                src={syncLogo}
                alt="Sync Screen Guard"
                className="h-8 sm:h-9 w-auto brightness-110"
              />
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Engineered with molecularly reinforced 9H aluminosilicate glass and foolproof 10-second alignment applicators. Precision protection for your flagship devices.
            </p>

            {/* Newsletter Subscription */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Get 10% Off Your First Order
              </h4>
              <p className="text-[11px] text-zinc-400">
                Subscribe for exclusive product drops and special member discounts.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {subscribed && (
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Thank you for subscribing! Your code is SYNC10.
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Shop Categories (2 Columns) */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop Categories
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              <li><Link to="/products" className="hover:text-white transition-colors">All Screen Guards</Link></li>
              <li><Link to="/products?category=privacy" className="hover:text-white transition-colors">Privacy Armor Glass</Link></li>
              <li><Link to="/products?category=matte" className="hover:text-white transition-colors">Matte Anti-Glare</Link></li>
              <li><Link to="/products?category=samsung" className="hover:text-white transition-colors">Samsung Series</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Auto-Align Kits</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care (2 Columns) */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              <li><Link to="/tracking" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Replacement Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Help (3 Columns) */}
          <div className="md:col-span-3 space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Support
            </h3>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email Us</p>
                  <p>support@syncarmor.in</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Helpline (Mon - Sat)</p>
                  <p>+91 98765 43210 (10 AM - 7 PM)</p>
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                  <Lock className="h-3 w-3" /> 256-Bit SSL Encrypted
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. Bottom Bar: Copyright & Payment Badges ── */}
        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} Sync Screen Guard. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 font-medium flex-wrap justify-center">
            <span className="text-zinc-500">Secure Payments:</span>
            <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-white font-bold text-[9px] sm:text-[10px]">UPI</span>
            <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-white font-bold text-[9px] sm:text-[10px]">Cards</span>
            <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-white font-bold text-[9px] sm:text-[10px]">Razorpay</span>
            <span className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-emerald-400 font-bold text-[9px] sm:text-[10px]">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
