import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, ChevronDown } from 'lucide-react';
import useCart from '../../hooks/useCart';
import { supabase } from '../../supabaseClient';
import CustomerAuthModal from './CustomerAuthModal';
import MobileMenu from './MobileMenu';
import syncLogo from '../../assets/sync logo.PNG';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    // Check Supabase session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCustomer(session.user);
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          setCustomer(JSON.parse(localUser));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCustomer(session.user);
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          setCustomer(JSON.parse(localUser));
        } else {
          setCustomer(null);
        }
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('local_customer_user');
    await supabase.auth.signOut();
    setCustomer(null);
  };

  const isActive = (path) => location.pathname === path;

  const customerEmail = customer?.email || 'Customer';
  const customerInitial = customerEmail ? customerEmail.charAt(0).toUpperCase() : 'C';
  const customerDisplayName = customerEmail.includes('@') ? customerEmail.split('@')[0] : customerEmail;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-2.5 sm:px-6 lg:px-8 ${
          isScrolled ? 'pt-1.5 sm:pt-2' : 'pt-2.5 sm:pt-4'
        }`}
      >
        <div
          className={`mx-auto max-w-7xl transition-all duration-500 rounded-2xl sm:rounded-[2rem] border bg-black shadow-2xl ${
            isScrolled
              ? 'py-2 px-3 sm:px-4 border-violet-500/30 shadow-violet-950/40'
              : 'border-violet-900/30 py-2.5 sm:py-3 px-3 sm:px-4'
          }`}
          style={{ background: '#000000' }}
        >
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            
            {/* --- Left Side: Mobile Menu Button (md:hidden) --- */}
            <div className="flex items-center md:hidden shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-500/20 bg-violet-950/30 text-violet-300 hover:text-violet-100 hover:bg-violet-900/40 transition-all cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* --- Logo Section: Centralized on Mobile, Left-aligned on Desktop --- */}
            <div className="flex items-center justify-center md:justify-start flex-1 md:flex-initial overflow-hidden">
              <Link to="/" className="flex items-center space-x-2 outline-none">
                <img
                  src={syncLogo}
                  alt="Sync Screenguard Logo"
                  className="h-7 sm:h-9 sm:h-10 w-auto object-contain max-h-8 sm:max-h-11 transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* --- Desktop Navigation (Center) --- */}
            <div className="hidden md:flex items-center space-x-2">
              {[
                { path: '/', label: 'HOME' },
                { path: '/products', label: 'PRODUCTS' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2 text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-full ${
                    isActive(link.path)
                      ? 'text-violet-200 bg-violet-900/40 border border-violet-500/50 shadow-lg shadow-violet-900/30'
                      : 'text-violet-300/70 hover:text-violet-200 hover:bg-violet-950/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* --- Right Side Actions --- */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-violet-500/20 bg-violet-950/30 transition-all duration-300 hover:bg-violet-900/40 hover:border-violet-500/50 group"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-violet-300 group-hover:text-violet-100 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white ring-2 ring-black">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="h-5 sm:h-6 w-[1px] bg-violet-800/40 mx-0.5 hidden sm:block" />

              {/* Auth Logic: Profile Pill & Dropdown when logged in */}
              {customer ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-1.5 sm:space-x-2 py-1 px-1 sm:pr-3 rounded-full border border-violet-500/40 bg-violet-950/40 hover:bg-violet-900/60 hover:border-violet-400 transition-all duration-300 cursor-pointer shadow-sm"
                    title={customerEmail}
                  >
                    {/* Avatar Circle */}
                    <div className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-violet-900/50 shrink-0">
                      {customerInitial}
                    </div>
                    {/* Username / Email snippet */}
                    <div className="hidden sm:flex flex-col text-left pr-0.5">
                      <span className="text-[11px] font-bold text-violet-100 max-w-[100px] truncate leading-tight">
                        {customerDisplayName}
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-400 leading-none">
                        Active Account
                      </span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-violet-400 transition-transform duration-200 hidden sm:block ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-950 border border-violet-900/60 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                      {/* Customer Details Header */}
                      <div className="px-3 py-2.5 rounded-xl bg-violet-950/40 border border-violet-800/30 mb-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-xs shrink-0 shadow-sm">
                            {customerInitial}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{customerEmail}</p>
                            <p className="text-[9px] font-semibold text-emerald-400">● Customer Store Account</p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1">
                        <Link
                          to="/tracking"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-violet-200 hover:bg-violet-900/40 hover:text-white transition-colors"
                        >
                          <Package className="h-4 w-4 text-violet-400" />
                          <span>My Orders & Tracking</span>
                        </Link>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 border border-violet-500/50 text-white shadow-md shadow-violet-900/50 transition-all cursor-pointer"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <User className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
                </button>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        customer={customer}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <CustomerAuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={(user) => setCustomer(user)}
      />
    </>
  );
}