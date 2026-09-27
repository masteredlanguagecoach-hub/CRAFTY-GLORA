'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Eye,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  X,
  CreditCard,
  User,
  ShoppingBag,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected order modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Paid');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = () => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setInternalNotes(order.internalNotes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, internalNotes }),
      });

      if (res.ok) {
        showToast(`Order status updated to "${newStatus}"`, 'success');
        setSelectedOrder(null);
        loadOrders();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Error updating status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            Dispatch & Fulfillment
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Order Management ({orders.length})
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-cream border border-craft-200">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, email, payment ID..."
              className="w-full px-4 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-9"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl font-medium focus:outline-none focus:border-gold"
            >
              <option value="all">All Statuses</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Paid">Paid / Confirmed</option>
              <option value="Processing">Processing / Crafting</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Patron Details</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-craft-950 block">
                        {order.id}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-craft-950">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500">{order.customerEmail}</p>
                      <p className="text-[10px] text-stone-400">{order.customerPhone}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="max-w-xs line-clamp-1 font-medium text-craft-900">
                        {order.productSummary}
                      </p>
                      {order.customizationDetails && (
                        <span className="text-[10px] text-gold-dark font-medium block truncate max-w-xs">
                          ★ {order.customizationDetails}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-serif font-bold text-sm text-craft-950">
                      {formatPrice(order.grandTotal)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          order.paymentStatus === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-craft-900 text-gold-light">
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-3 py-1.5 rounded-lg bg-sand hover:bg-craft-200 text-craft-900 font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-craft-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-cream rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Order Details
                </span>
                <h3 className="font-mono text-xl font-bold text-craft-950">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-craft-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector & Notes */}
            <div className="p-4 rounded-2xl bg-sand/50 border border-craft-300 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-craft-800 uppercase tracking-wider mb-1">
                    Update Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl font-semibold text-craft-950"
                  >
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Paid">Paid / Confirmed</option>
                    <option value="Processing">Processing / Crafting</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-craft-800 uppercase tracking-wider mb-1">
                    Internal Atelier Notes
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Inscribed with gold leaf on 28th"
                    className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-5 py-2 bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-wider font-semibold rounded-xl shadow-xs"
                >
                  {updating ? 'Updating...' : 'Save Status Change'}
                </button>
              </div>
            </div>

            {/* Items in Order */}
            <div>
              <h4 className="font-serif text-base font-semibold text-craft-950 mb-3">
                Items Purchased
              </h4>
              <div className="divide-y divide-craft-200 border border-craft-200 rounded-2xl bg-white overflow-hidden p-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3 text-xs">
                    {item.image && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-sand shrink-0">
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-craft-950">{item.productName}</p>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity} • SKU: {item.sku}</p>
                      {item.customization && (
                        <p className="text-[11px] text-gold-dark font-medium">
                          Customization: {JSON.stringify(item.customization)}
                        </p>
                      )}
                    </div>
                    <span className="font-serif font-bold text-craft-950 text-sm">
                      {formatPrice(item.finalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Razorpay Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-craft-200 space-y-1">
                <h5 className="font-bold text-craft-950 flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>Patron Delivery Address</span>
                </h5>
                <p className="font-semibold">{selectedOrder.customerName}</p>
                <p className="text-stone-600">{selectedOrder.shippingAddress.house}, {selectedOrder.shippingAddress.street}</p>
                <p className="text-stone-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pin}</p>
                <p className="text-stone-600">Phone: {selectedOrder.customerPhone}</p>
                <p className="text-stone-600">Email: {selectedOrder.customerEmail}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-craft-200 space-y-1">
                <h5 className="font-bold text-craft-950 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-gold" />
                  <span>Payment & Financials</span>
                </h5>
                <p className="text-stone-600">
                  Razorpay Order ID: <span className="font-mono text-[11px]">{selectedOrder.razorpayOrderId || 'N/A'}</span>
                </p>
                <p className="text-stone-600">
                  Razorpay Payment ID: <span className="font-mono text-[11px] font-bold">{selectedOrder.razorpayPaymentId || 'N/A'}</span>
                </p>
                <p className="text-stone-600">Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
                <p className="text-stone-600">Shipping: {formatPrice(selectedOrder.shipping)}</p>
                <p className="text-stone-600">Tax (5% GST): {formatPrice(selectedOrder.tax)}</p>
                <p className="font-serif font-bold text-craft-950 text-sm pt-1">
                  Grand Total: {formatPrice(selectedOrder.grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
