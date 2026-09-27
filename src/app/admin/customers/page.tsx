'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Customer } from '@/types';
import { formatPrice } from '@/lib/config';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our system, customers are recorded through customerRepo
    fetch('/api/orders')
      .then((r) => r.json())
      .then((orders) => {
        // Derive customers from orders
        const map = new Map<string, Customer>();
        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            const email = o.customerEmail || 'unknown@example.com';
            if (!map.has(email)) {
              map.set(email, {
                id: o.customerId || `cust-${email}`,
                name: o.customerName,
                email: o.customerEmail,
                phone: o.customerPhone,
                address: `${o.shippingAddress?.house || ''}, ${o.shippingAddress?.street || ''}`,
                city: o.shippingAddress?.city || '',
                district: o.shippingAddress?.district || '',
                state: o.shippingAddress?.state || '',
                pin: o.shippingAddress?.pin || '',
                country: 'India',
                createdAt: o.createdAt,
                lastOrderDate: o.createdAt,
                totalOrders: 1,
                totalSpent: o.grandTotal,
              });
            } else {
              const existing = map.get(email)!;
              existing.totalOrders += 1;
              existing.totalSpent += o.grandTotal;
            }
          });
        }
        setCustomers(Array.from(map.values()));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            Directory & Patron Lifetime Value
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Artisan Patrons ({customers.length})
          </h1>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl bg-cream border border-craft-200">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patrons by name, email, or city..."
              className="w-full px-4 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-9"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Patron Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Value</th>
                  <th className="py-3.5 px-6">First Patronage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-craft-950">
                      {c.name}
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      <p>{c.email}</p>
                      <p className="text-[10px] text-stone-400">{c.phone}</p>
                    </td>
                    <td className="py-4 px-4 text-craft-800">
                      {c.city ? `${c.city}, ${c.state}` : 'India'}
                    </td>
                    <td className="py-4 px-4 font-bold text-craft-950">
                      {c.totalOrders} order{c.totalOrders > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-4 font-serif font-bold text-craft-950">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-4 px-6 text-stone-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
