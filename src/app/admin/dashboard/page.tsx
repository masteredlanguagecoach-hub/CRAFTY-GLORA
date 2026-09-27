'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatPrice } from '@/lib/config';
import { Order, Product } from '@/types';

interface DashboardStats {
  totalSales: number;
  todaySales: number;
  monthlySales: number;
  averageOrderValue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockItems: any[];
  bestSellingProducts: Product[];
  recentOrders: Order[];
  salesChart: { date: string; day: string; revenue: number }[];
  googleSheetsConfigured: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setStats(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-xs text-stone-500">
          Loading atelier dashboard analytics...
        </div>
      </AdminLayout>
    );
  }

  const maxRevenue = Math.max(
    ...stats.salesChart.map((d) => d.revenue),
    5000
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
              Overview & Key Performance Indicators
            </span>
            <h1 className="font-serif text-3xl font-semibold text-craft-950">
              Atelier Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 bg-craft-900 hover:bg-craft-800 text-cream rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-gold" />
              <span>Add New Craft</span>
            </Link>
          </div>
        </div>

        {/* Top 4 Primary KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider">Gross Sales</span>
              <div className="p-2 rounded-xl bg-gold/10 text-gold-dark">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-craft-950">
              {formatPrice(stats.totalSales)}
            </h3>
            <p className="text-[11px] text-stone-500">
              Today: <strong className="text-emerald-700">{formatPrice(stats.todaySales)}</strong> • Month: {formatPrice(stats.monthlySales)}
            </p>
          </div>

          {/* Total Orders */}
          <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider">Total Orders</span>
              <div className="p-2 rounded-xl bg-sand text-craft-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-craft-950">
              {stats.totalOrders}
            </h3>
            <p className="text-[11px] text-stone-500">
              <span className="text-amber-700 font-semibold">{stats.pendingOrders} Processing</span> • {stats.deliveredOrders} Delivered
            </p>
          </div>

          {/* Average Order Value */}
          <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider">Average Order</span>
              <div className="p-2 rounded-xl bg-sand text-craft-800">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-craft-950">
              {formatPrice(stats.averageOrderValue)}
            </h3>
            <p className="text-[11px] text-stone-500">
              Across {stats.totalCustomers} registered patrons
            </p>
          </div>

          {/* Low Stock Warning */}
          <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider">Inventory Health</span>
              <div className={`p-2 rounded-xl ${stats.lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-craft-950">
              {stats.lowStockCount} Items Low
            </h3>
            <p className="text-[11px] text-stone-500">
              {stats.totalProducts} active catalogue listings
            </p>
          </div>
        </div>

        {/* Middle Section: 7-Day Revenue Chart (8 cols) + Google Sheets Status (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sales Chart (8 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-craft-950">
                  Sales Trend (Last 7 Days)
                </h3>
                <p className="text-xs text-stone-500">Verified Razorpay receipts</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-sand rounded-full text-craft-900 border border-craft-300">
                7 Days
              </span>
            </div>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-craft-200 pb-2">
              {stats.salesChart.map((d, i) => {
                const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-craft-900 transition-opacity whitespace-nowrap">
                      {formatPrice(d.revenue)}
                    </div>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-craft-900 to-gold rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] font-semibold text-stone-500 uppercase">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Sheets / Database Sync Box (4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif text-lg font-semibold text-craft-950">
                  Google Sheets Database
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Orders and product entries are automatically mirrored to the configured Google Sheets database (10-sheet schema).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand/50 border border-craft-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-600">Sync Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {stats.googleSheetsConfigured ? 'Connected & Live' : 'Active Local Store'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-600">Storage Driver</span>
                <span className="font-mono text-craft-950 text-[11px]">
                  {stats.googleSheetsConfigured ? 'Sheets v4 + Drive' : 'Persistent Local File'}
                </span>
              </div>
            </div>

            <Link
              href="/admin/settings"
              className="w-full py-2.5 px-4 rounded-xl border border-craft-300 hover:border-craft-900 text-center text-xs font-semibold text-craft-900 transition-colors"
            >
              Test Sheet Connection
            </Link>
          </div>
        </div>

        {/* Bottom Row: Recent Orders (8 cols) + Best Sellers (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-craft-200">
              <h3 className="font-serif text-lg font-semibold text-craft-950">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders"
                className="text-xs text-craft-700 hover:text-craft-950 font-semibold flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-craft-200/80 text-stone-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Patron</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-craft-200/60">
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-sand/40 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-craft-950">
                        {o.id}
                      </td>
                      <td className="py-3.5 font-medium text-craft-900">
                        {o.customerName}
                      </td>
                      <td className="py-3.5 font-serif font-bold text-craft-950">
                        {formatPrice(o.grandTotal)}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-craft-900 text-gold-light">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-stone-500">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-semibold text-craft-950 pb-3 border-b border-craft-200">
              Signature Best Sellers
            </h3>

            <div className="space-y-3">
              {stats.bestSellingProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-sand/50 transition-colors">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sand shrink-0">
                    <Image src={p.mainImage} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-craft-950 truncate">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-stone-500">{p.category}</span>
                  </div>
                  <span className="text-xs font-serif font-bold text-craft-950">
                    {formatPrice(p.salePrice ?? p.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
