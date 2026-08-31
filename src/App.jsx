import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CartProvider from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { AdminAuthProvider } from './admin/hooks/useAdminAuth';
import AppRoutes from './routes';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CustomerAuthProvider>
        <CartProvider>
          <AdminAuthProvider>
            <AppRoutes />
          </AdminAuthProvider>
        </CartProvider>
      </CustomerAuthProvider>
    </BrowserRouter>
  );
}

