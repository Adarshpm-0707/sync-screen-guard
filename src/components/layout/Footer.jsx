import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import syncLogo from '../../assets/sync logo.PNG';

export default function Footer() {
  return (
    <footer className="border-t border-violet-900/40 bg-black text-violet-300" style={{ background: '#000000' }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Column 1: Brand & Tagline */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2.5">
              <img
                src={syncLogo}
                alt="Sync Screenguard Logo"
                className="h-10 w-auto object-contain max-h-12"
              />
            </div>
            <p className="text-xs text-violet-300/80 leading-relaxed font-medium">
              Premium tempered glass screenguards equipped with auto-alignment installation boxes. Shield your display flawlessly.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-display text-xs font-black tracking-wider text-violet-400 uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs text-violet-300 font-semibold">
              <li><Link to="/" className="hover:text-violet-100 transition-colors duration-250">Home</Link></li>
              <li><Link to="/products" className="hover:text-violet-100 transition-colors duration-250">Products</Link></li>
              <li><Link to="/tracking" className="hover:text-violet-100 transition-colors duration-250">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-display text-xs font-black tracking-wider text-violet-400 uppercase">
              Policies
            </h3>
            <ul className="space-y-2.5 text-xs text-violet-300 font-semibold">
              <li><Link to="/shipping-policy" className="hover:text-violet-100 transition-colors duration-250">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-violet-100 transition-colors duration-250">Return Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-violet-100 transition-colors duration-250">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-violet-100 transition-colors duration-250">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-display text-xs font-black tracking-wider text-violet-400 uppercase">
              Contact
            </h3>
            <ul className="space-y-2.5 text-xs text-violet-300 font-semibold">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-violet-400" />
                <span>support@syncarmor.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-violet-400" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & payment methods */}
        <div className="mt-12 border-t border-violet-900/30 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-violet-400/70 font-semibold">
            © {new Date().getFullYear()} Sync Armor. All rights reserved.
          </p>
          
          {/* Payment Badges */}
          <div className="flex items-center space-x-3 text-[11px] text-violet-300 bg-violet-950/40 border border-violet-800/30 px-4 py-2 rounded-2xl">
            <span className="font-bold text-violet-200">Accepted:</span>
            <span>Razorpay</span>
            <span className="text-violet-800">|</span>
            <span>Cash On Delivery (COD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
