'use client';

import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, CheckCircle, Search, Edit2, Check, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { InventoryItem } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [newThresholdVal, setNewThresholdVal] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  const loadInventory = () => {
    fetch('/api/admin/inventory')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setNewStockVal(item.currentStock);
    setNewThresholdVal(item.lowStockThreshold);
  };

  const handleSaveStock = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingItem.productId,
          currentStock: newStockVal,
          lowStockThreshold: newThresholdVal,
        }),
      });

      if (res.ok) {
        showToast('Stock updated successfully', 'success');
        setEditingItem(null);
        loadInventory();
      } else {
        showToast('Failed to update stock', 'error');
      }
    } catch {
      showToast('Error updating stock', 'error');
    }
  };

  const filtered = items.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            Real-time Studio Stock
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Inventory & Stock Levels ({items.length})
          </h1>
        </div>

        {/* Search */}
        <div className="p-4 rounded-2xl bg-cream border border-craft-200">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by craft piece or SKU..."
              className="w-full px-4 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-9"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Sold Units</th>
                  <th className="py-3.5 px-4">Threshold</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {filtered.map((item) => (
                  <tr key={item.productId} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-craft-950">
                      {item.sku}
                    </td>

                    <td className="py-4 px-4 font-semibold text-craft-950">
                      {item.productName}
                    </td>

                    <td className="py-4 px-4 font-bold text-sm text-craft-950">
                      {item.currentStock}
                    </td>

                    <td className="py-4 px-4 text-stone-600 font-medium">
                      {item.soldQuantity}
                    </td>

                    <td className="py-4 px-4 text-stone-500">
                      {item.lowStockThreshold}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.currentStock === 0
                            ? 'bg-red-100 text-red-800'
                            : item.currentStock <= item.lowStockThreshold
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-sand hover:bg-craft-200 text-craft-900 font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-craft-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-cream rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-craft-200">
              <h3 className="font-serif text-lg font-semibold text-craft-950">
                Adjust Stock: {editingItem.productName}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-stone-400 hover:text-craft-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-craft-800 mb-1">Available Units</label>
                <input
                  type="number"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-craft-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-craft-800 mb-1">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={newThresholdVal}
                  onChange={(e) => setNewThresholdVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-craft-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStock}
                  className="px-6 py-2.5 bg-craft-900 text-cream rounded-xl font-semibold uppercase tracking-wider shadow-soft"
                >
                  Update Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
