import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  UserCog,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Store,
  ChevronLeft
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin, isSales, isStock } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_visible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_visible', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    ...(isAdmin || isSales || user?.role === 'staff'
      ? [{ to: '/sales', label: 'Sell / POS', icon: ShoppingBag }]
      : []),
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdmin || isStock || user?.role === 'staff'
      ? [{ to: '/products', label: 'Items & Stock', icon: Package }]
      : []),
    ...(isAdmin || isSales || user?.role === 'staff'
      ? [{ to: '/customers', label: 'Customers & Credit', icon: Users }]
      : []),
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
            <p className="text-[10px] text-slate-400">Inventory & Sales System</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen transition-all duration-300 ease-in-out overflow-hidden z-20 ${
          sidebarVisible ? 'w-64' : 'w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Store size={20} />
              </div>
              <div className="truncate">
                <h1 className="font-bold text-base text-white tracking-tight leading-none">
                  ElectroShop
                </h1>
                <span className="text-[11px] text-indigo-400 font-medium">Inventory & Sales</span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              title="Hide Sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            >
              <ChevronLeft size={18} />
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar Toggle (when sidebar is hidden) */}
        {!sidebarVisible && (
          <div className="hidden md:flex items-center px-4 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition border border-slate-200"
              title="Show Menu"
            >
              <Menu size={16} />
              <span>Show Menu</span>
            </button>
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
