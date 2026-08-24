import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CartProvider from './context/CartContext';
import { AdminAuthProvider } from './admin/hooks/useAdminAuth';
import AppRoutes from './routes';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
