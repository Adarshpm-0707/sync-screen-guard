import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, User, LogOut, Package, Menu, ChevronDown, 
  Search, ShieldCheck, Sparkles, ArrowRight 
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import { supabase } from '../../supabaseClient';
import CustomerAuthModal from './CustomerAuthModal';
import MobileMenu from './MobileMenu';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import syncLogo from '../../assets/sync logo.PNG';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const profileRef = useRef(null);
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check Supabase session
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
      setIsScrolled(window.scrollY > 20);
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
   

      {/* ── 2. Sticky Main Header ── */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 bg-black ${
          isScrolled 
            ? 'shadow-xl py-3 border-b border-zinc-800' 
            : 'py-4 border-b border-zinc-900'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Mobile Menu Trigger (md:hidden) */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <img
                  src={syncLogo}
                  alt="Sync Screen Guard Logo"
                  className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {[
                { path: '/', label: 'HOME' },
                { path: '/products', label: 'ALL PRODUCTS' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 text-xs font-bold tracking-wider transition-colors rounded-full ${
                    isActive(link.path)
                      ? 'text-white bg-zinc-800 font-extrabold border border-zinc-700'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Utilities: Search, Account, Bag */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Live Search Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                aria-label="Search Catalog"
                title="Search"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* User Account / Sign In */}
              {customer ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 transition-colors cursor-pointer"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-xs">
                      {customerInitial}
                    </div>
                    <span className="hidden sm:block text-xs font-bold text-zinc-100 max-w-[100px] truncate">
                      {customerDisplayName}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">{customerEmail}</p>
                        <span className="text-[10px] text-emerald-400 font-semibold">Active Customer</span>
                      </div>
                      <Link
                        to="/tracking"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-colors"
                      >
                        <Package className="h-4 w-4 text-zinc-400" />
                        <span>My Orders & Tracking</span>
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  aria-label="Account Login"
                  title="Sign In"
                >
                  <User className="h-4.5 w-4.5" />
                </button>
              )}

              {/* Shopping Bag Drawer Trigger */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all cursor-pointer shadow-sm group"
                aria-label="View Shopping Bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer 
        isOpen={cartDrawerOpen} 
        onClose={() => setCartDrawerOpen(false)} 
      />

      {/* Live Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* Mobile Nav Drawer */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        customer={customer}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={(user) => setCustomer(user)}
      />
    </>
  );
}