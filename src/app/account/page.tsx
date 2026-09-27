'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  MapPin,
  Star,
  ShoppingBag,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { Order, Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/config';

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(
    initialTab
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setAllProducts(productsData);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-craft-200 mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-craft-900 text-gold flex items-center justify-center font-serif text-2xl font-bold shadow-soft">
            PS
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-craft-600">
              Patron Dashboard
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-craft-950">
              Welcome back, Priyanka Sen
            </h1>
            <p className="text-xs text-stone-500">priyanka.sen@example.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop New Pieces</span>
          </Link>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Tab Nav (3 cols) */}
        <div className="lg:col-span-3 space-y-1 bg-cream p-3 rounded-2xl border border-craft-200 h-fit">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlistIds.length },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Patron Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-craft-900 text-cream shadow-xs'
                    : 'text-stone-600 hover:bg-sand/60 hover:text-craft-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-craft-950' : 'text-gold'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      active ? 'bg-craft-800 text-gold-light' : 'bg-sand text-craft-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Tab Content (9 cols) */}
        <div className="lg:col-span-9">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold text-craft-950">
                Order History & Status
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-cream rounded-3xl border border-craft-200 p-8">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-1" />
                  <h3 className="font-serif text-lg font-medium text-craft-950 mb-1">
                    Your first Crafty Glora order starts here.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                    Browse our handcrafted catalogue to discover memorable pieces and customized keepsakes.
                  </p>
                  <Link
                    href="/shop"
                    className="px-6 py-2.5 rounded-xl bg-craft-900 text-cream text-xs uppercase tracking-wider font-semibold"
                  >
                    Explore Catalogue
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-craft-200 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-craft-950 text-sm">
                              {order.id}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-craft-900 text-gold-light font-bold text-[10px] uppercase">
                              {order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-base text-craft-950">
                            {formatPrice(order.grandTotal)}
                          </span>
                          <Link
                            href={`/track-order?id=${order.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-sand hover:bg-craft-200 text-craft-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-gold-dark" />
                            <span>Track</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-sand shrink-0">
                                  <Image src={item.image} alt={item.productName} fill className="object-cover" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-craft-950">{item.productName}</p>
                                <p className="text-[11px] text-stone-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-craft-900">
                              {formatPrice(item.finalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold text-craft-950">
                Your Saved Pieces ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 bg-cream rounded-3xl border border-craft-200 p-8">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3 stroke-1" />
                  <h3 className="font-serif text-lg font-medium text-craft-950 mb-1">
                    Save the pieces you love.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                    Tap the heart icon on any craft to keep it bookmarked here for upcoming celebrations.
                  </p>
                  <Link
                    href="/shop"
                    className="px-6 py-2.5 rounded-xl bg-craft-900 text-cream text-xs uppercase tracking-wider font-semibold"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-cream border border-craft-200 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sand mb-3">
                          <Image src={p.mainImage} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-craft-600 block mb-1">
                          {p.category}
                        </span>
                        <Link
                          href={`/product/${p.slug}`}
                          className="font-serif text-sm font-semibold text-craft-950 hover:text-gold-dark block line-clamp-1 mb-1"
                        >
                          {p.name}
                        </Link>
                        <span className="font-serif font-bold text-sm text-craft-950">
                          {formatPrice(p.salePrice ?? p.price)}
                        </span>
                      </div>

                      <div className="pt-3 mt-3 border-t border-craft-200/80 flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex-1 py-2 rounded-lg bg-craft-900 hover:bg-craft-800 text-cream text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id, p.name)}
                          className="p-2 rounded-lg border border-craft-300 hover:border-red-300 text-red-500 bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold text-craft-950">
                Saved Delivery Addresses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-cream border-2 border-craft-300 shadow-soft relative">
                  <span className="absolute top-4 right-4 bg-sand text-craft-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Default
                  </span>
                  <h3 className="font-serif text-base font-semibold text-craft-950 mb-1">
                    Primary Residence
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Flat 402, Lotus Orchid, Palm Beach Road, Sector 19<br />
                    Navi Mumbai, Maharashtra - 400706<br />
                    Phone: +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="font-serif text-xl font-semibold text-craft-950">
                Patron Information
              </h2>
              <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-craft-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Priyanka Sen"
                    className="w-full px-4 py-2.5 bg-white border border-craft-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-craft-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue="priyanka.sen@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-craft-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-craft-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full px-4 py-2.5 bg-white border border-craft-300 rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-craft-900 text-cream rounded-xl font-semibold uppercase tracking-wider text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-stone-500">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
