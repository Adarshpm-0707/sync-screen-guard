import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <AdminHeader onMenuToggle={toggleSidebar} />

        {/* Dynamic Page Outlet Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 bg-[#0B0F19]/90 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
