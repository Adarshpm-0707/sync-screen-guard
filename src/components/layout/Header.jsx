import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import syncLogo from '../../assets/sync logo.PNG';

export default function Header({ cartCount = 0, onCartClick }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-border bg-dark-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <img
            src={syncLogo}
            alt="Sync Screenguard Logo"
            className="h-10 w-auto object-contain max-h-11"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#" className="transition-colors duration-200 hover:text-primary-500">
            EZ Fit Box
          </a>
          <a href="#" className="transition-colors duration-200 hover:text-primary-500">
            Why Us
          </a>
          <a href="#" className="transition-colors duration-200 hover:text-primary-500">
            Installation Guide
          </a>
          <a href="#" className="transition-colors duration-200 hover:text-primary-500">
            Track Order
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCartClick}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-dark-border bg-dark-card transition-all duration-200 hover:border-primary-500/50 hover:bg-dark-card/85 focus:outline-none"
            aria-label="Open Cart"
          >
            <ShoppingBag className="h-5 w-5 text-slate-300 transition-colors duration-200 group-hover:text-primary-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-dark-bg">
                {cartCount}
              </span>
            )}
          </button>
          
          <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-dark-border bg-dark-card text-slate-300 hover:text-primary-500">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
