import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

/**
 * Main customer layout wrapper containing ScrollToTop, Navbar, page Outlet, and Footer.
 */
export default function CustomerLayout() {
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
