'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Check,
  X,
  Star,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Category, Product } from '@/types';
import { formatPrice } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Resin Crafts',
    shortDescription: '',
    description: '',
    price: 999,
    salePrice: undefined,
    costPrice: 400,
    discountPercentage: 0,
    stockQuantity: 10,
    lowStockThreshold: 3,
    status: 'Active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isCustomizable: true,
    materials: '',
    dimensions: '',
    mainImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    images: [],
  });

  const loadData = () => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prodsData, catsData]) => {
        if (Array.isArray(prodsData)) setProducts(prodsData);
        if (Array.isArray(catsData)) setCategories(catsData);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Resin Crafts',
      shortDescription: '',
      description: '',
      price: 999,
      salePrice: undefined,
      costPrice: 400,
      discountPercentage: 0,
      stockQuantity: 10,
      lowStockThreshold: 3,
      status: 'Active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isCustomizable: true,
      materials: '',
      dimensions: '',
      mainImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      images: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...p,
          name: `${p.name} (Copy)`,
          sku: `${p.sku}-CPY`,
          id: undefined,
        }),
      });

      if (res.ok) {
        showToast('Product duplicated successfully', 'success');
        loadData();
      } else {
        showToast('Failed to duplicate product', 'error');
      }
    } catch {
      showToast('Error duplicating product', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted', 'info');
        loadData();
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(editingProduct ? 'Product updated' : 'New craft listed!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('Failed to save product', 'error');
      }
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.category.toLowerCase() !== selectedCat.toLowerCase())
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
              Catalogue Management
            </span>
            <h1 className="font-serif text-3xl font-semibold text-craft-950">
              Craft Products ({products.length})
            </h1>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-craft-900 hover:bg-craft-800 text-cream rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 shadow-soft"
          >
            <Plus className="w-4 h-4 text-gold" />
            <span>Add New Craft Piece</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-cream border border-craft-200">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by craft name, SKU, or category..."
              className="w-full px-4 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-9"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl font-medium focus:outline-none focus:border-gold"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sand shrink-0 border border-craft-200">
                          <Image src={p.mainImage} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-craft-950">
                            {p.name}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400">
                            {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-craft-800">
                      {p.category}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-craft-950">
                          {formatPrice(p.salePrice ?? p.price)}
                        </span>
                        {p.salePrice && (
                          <span className="text-[10px] text-stone-400 line-through">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.stockQuantity === 0
                            ? 'bg-red-100 text-red-800'
                            : p.stockQuantity <= p.lowStockThreshold
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stockQuantity} in stock
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isBestSeller && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                            Best Seller
                          </span>
                        )}
                        {p.isNewArrival && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[9px] font-bold">
                            New
                          </span>
                        )}
                        {p.isCustomizable && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[9px] font-bold">
                            Custom
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg hover:bg-sand text-stone-600 hover:text-craft-950 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg hover:bg-sand text-stone-600 hover:text-craft-950 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-craft-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-cream rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200">
              <h3 className="font-serif text-xl font-semibold text-craft-950">
                {editingProduct ? 'Edit Craft Piece' : 'Add New Craft Listing'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-craft-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-craft-800 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">SKU (Auto or Custom)</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="CG-RES-FLW-99"
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">Sale Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={formData.salePrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Leave blank if no discount"
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-craft-800 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-craft-800 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.mainImage}
                    onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-craft-800 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-craft-800 mb-1">Detailed Story & Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-craft-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-gold"
                    />
                    <span>Featured Piece</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="accent-gold"
                    />
                    <span>Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="accent-gold"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isCustomizable}
                      onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
                      className="accent-gold"
                    />
                    <span>Allow Customization</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-craft-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-craft-950 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-craft-900 hover:bg-craft-800 text-cream rounded-xl font-semibold uppercase tracking-wider shadow-soft"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
