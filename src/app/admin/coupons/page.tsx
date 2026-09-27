'use client';

import React, { useState } from 'react';
import { Tag, Plus, Check, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { INITIAL_COUPONS } from '@/lib/db/initialData';
import { Coupon } from '@/types';
import { formatPrice } from '@/lib/config';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            Promotions & Gift Discounts
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Coupons & Vouchers ({coupons.length})
          </h1>
        </div>

        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Min. Order</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-craft-950">
                      {c.code}
                    </td>

                    <td className="py-4 px-4 font-bold text-emerald-800">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </td>

                    <td className="py-4 px-4 font-medium text-craft-900">
                      {formatPrice(c.minimumOrder)}
                    </td>

                    <td className="py-4 px-4 text-stone-600">
                      {c.usedCount} / {c.usageLimit}
                    </td>

                    <td className="py-4 px-4 text-stone-500 text-[11px]">
                      {c.startDate} to {c.endDate}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
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
