import React, { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileMenu from './components/layout/MobileMenu';

// Page Imports
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import ProductsPage from './pages/ProductsPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import NotFound from './pages/NotFound';

// Admin Imports
import AdminRoutes from './admin/routes/AdminRoutes';
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminSignup from './admin/pages/AdminSignup';
import Dashboard from './admin/pages/Dashboard';
import Orders from './admin/pages/Orders';
import OrderDetail from './admin/pages/OrderDetail';
import Products from './admin/pages/Products';
import Shipments from './admin/pages/Shipments';
import Settings from './admin/pages/Settings';
import AdminNotFound from './admin/pages/AdminNotFound';

// Shareable flagship product config
const FLAGSHIP_PRODUCT = {
  id: 'sync-screenguard-ez-fit',
  name: 'Sync EZ Fit Glass Screenguard',
  price: 640,
  original_price: 999,
  description: 'Our premium tempered glass screenguard comes with the revolutionary EZ Fit alignment box. No alignment issues, no dust, no bubbles—just perfect, edge-to-edge application in less than 30 seconds.',
  stock: 120,
  images: [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600'
  ]
};

import { CustomerThemeProvider, useCustomerTheme } from './context/CustomerThemeContext';

function CustomerLayoutWrapper() {
  const { activeTheme } = useCustomerTheme();

  return (
    <div
      className="relative flex min-h-screen flex-col antialiased text-neutral-950 transition-colors duration-700 overflow-x-hidden"
      style={{
        background: `linear-gradient(to bottom, ${activeTheme.bgFrom}, ${activeTheme.bgMid}, ${activeTheme.bgTo})`,
        transition: 'background 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Dynamic blurred ambient glow blobs */}
      <div
        className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[140px] rounded-full pointer-events-none z-0"
        style={{ backgroundColor: activeTheme.glow1, transition: 'background-color 0.8s ease' }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] blur-[140px] rounded-full pointer-events-none z-0"
        style={{ backgroundColor: activeTheme.glow2, transition: 'background-color 0.8s ease' }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] blur-[160px] rounded-full pointer-events-none z-0"
        style={{ backgroundColor: activeTheme.glow3, transition: 'background-color 0.8s ease' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Layout() {
  return (
    <CustomerThemeProvider>
      <CustomerLayoutWrapper />
    </CustomerThemeProvider>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Pages */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home product={FLAGSHIP_PRODUCT} />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="product" element={<ProductDetail product={FLAGSHIP_PRODUCT} />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="success" element={<OrderSuccess />} />
        <Route path="tracking" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Gateway Login & Signup (Unprotected) */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/signup" element={<AdminSignup />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminRoutes />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
