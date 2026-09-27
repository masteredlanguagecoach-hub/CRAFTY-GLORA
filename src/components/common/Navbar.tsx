'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { openCart, totalItemsCount } = useCart();
  const { wishlistIds } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    { label: 'COLLECTIONS', href: '/collections' },
    { label: 'NEW ARRIVALS', href: '/shop?filter=new' },
    { label: 'BEST SELLERS', href: '/shop?filter=bestseller' },
    { label: 'ABOUT US', href: '/about' },
    { label: 'CONTACT', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                className="p-2 text-craft-800 hover:text-craft-950 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-block group">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-craft-900 group-hover:text-gold-dark transition-colors">
                      CRAFTY GLORA
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-craft-600 font-medium -mt-1 hidden sm:block">
                    Artisan Studio & Handcrafts
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative text-xs tracking-[0.16em] uppercase font-semibold transition-all duration-300 py-1 ${
                      active
                        ? 'text-craft-950 font-bold'
                        : 'text-stone-600 hover:text-craft-950'
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Utility Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search products"
                className="p-2 rounded-full hover:bg-sand/70 text-craft-800 hover:text-craft-950 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account?tab=wishlist"
                aria-label="Wishlist"
                className="p-2 rounded-full hover:bg-sand/70 text-craft-800 hover:text-craft-950 transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Account Link */}
              <Link
                href="/account"
                aria-label="Customer Account"
                className="p-2 rounded-full hover:bg-sand/70 text-craft-800 hover:text-craft-950 transition-colors hidden sm:flex"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                aria-label="Open Cart"
                className="p-2.5 rounded-full bg-craft-900 text-cream hover:bg-craft-800 transition-all shadow-soft hover:shadow-card relative flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItemsCount > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-gold text-white">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-craft-200 bg-cream px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider font-semibold text-craft-800 hover:text-gold-dark py-2 border-b border-craft-200/50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider font-semibold text-craft-800 hover:text-gold-dark py-2 border-b border-craft-200/50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-gold" />
                <span>My Account & Orders</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-wider font-semibold text-craft-800 hover:text-gold-dark py-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Track Your Order</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
