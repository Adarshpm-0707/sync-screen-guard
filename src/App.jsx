import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CartProvider from './context/CartContext';
import { AdminAuthProvider } from './admin/hooks/useAdminAuth';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
