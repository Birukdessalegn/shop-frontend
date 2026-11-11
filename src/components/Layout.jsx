import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Barcode,
  Users,
  UserCog,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Store,
  SearchCheck
} from 'lucide-react';
import VerifyItemModal from './VerifyItemModal';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Items & Catalog', icon: Package },
    { to: '/serials', label: 'Serial Numbers', icon: Barcode },
    { to: '/customers', label: 'Customers & Credit', icon: Users },
    ...(isAdmin ? [{ to: '/users', label: 'Staff & Users', icon: UserCog }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Store size={18} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">ElectroShop</h1>
            <p className="text-[10px] text-slate-400">Inventory & Serial Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1"
          >
            <SearchCheck size={16} />
            <span className="font-semibold text-[11px]">Verify</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-medium text-white">{user?.name}</p>
              <p className="text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:bg-red-950/40"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Store size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none">
                ElectroShop
              </h1>
              <span className="text-xs text-indigo-400 font-medium">Inventory & Serial OS</span>
            </div>
          </div>
        </div>

        {/* Quick Ownership Verification Tool Button */}
        <div className="px-4 pt-4">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shadow-xs transition"
          >
            <div className="flex items-center gap-2">
              <SearchCheck size={16} className="text-emerald-400" />
              <span>Verify Item Serial</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
              Check
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0 font-bold border border-slate-700">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  {isAdmin ? (
                    <ShieldCheck size={12} className="text-emerald-400" />
                  ) : (
                    <UserCheck size={12} className="text-sky-400" />
                  )}
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Ownership Verification Modal */}
      <VerifyItemModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
