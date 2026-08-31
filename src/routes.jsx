import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';

// Page Imports
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import ProductsPage from './pages/ProductsPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';

// Admin Imports
import AdminRoutes from './admin/routes/AdminRoutes';
import AdminLayout from './admin/components/layout/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminSignup from './admin/pages/AdminSignup';
import Dashboard from './admin/pages/Dashboard';
import Orders from './admin/pages/Orders';
import OrderDetail from './admin/pages/OrderDetail';
import Customers from './admin/pages/Customers';
import Products from './admin/pages/Products';
import Inventory from './admin/pages/Inventory';
import Categories from './admin/pages/Categories';
import Shipments from './admin/pages/Shipments';
import Settings from './admin/pages/Settings';
import AdminNotFound from './admin/pages/AdminNotFound';

function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Store Pages */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="product" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="success" element={<OrderSuccess />} />
        <Route path="tracking" element={<OrderTracking />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="terms" element={<TermsConditions />} />
        <Route path="terms-conditions" element={<TermsConditions />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
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
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

