'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Users,
  Star,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', href: '/admin/inventory', icon: Layers },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Settings & Sync', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-craft-950 text-craft-100 p-6 border-r border-craft-900 justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-wider text-white">
              CRAFTY GLORA
            </span>
            <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold text-[9px] uppercase font-bold tracking-widest">
              Admin
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-gold text-craft-950 font-bold shadow-soft'
                      : 'text-craft-300 hover:bg-craft-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-craft-950' : 'text-gold'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-craft-900 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-craft-300 hover:text-gold transition-colors px-2 py-1.5"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-cream border-b border-craft-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-craft-900 rounded-lg hover:bg-sand"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs uppercase font-bold tracking-widest text-craft-600 hidden sm:inline">
              Management Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio Engine Active</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-craft-900 text-gold flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-craft-950 text-craft-100 p-4 border-b border-craft-900 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-craft-200 hover:bg-craft-900"
                >
                  <Icon className="w-4 h-4 text-gold" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-craft-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
