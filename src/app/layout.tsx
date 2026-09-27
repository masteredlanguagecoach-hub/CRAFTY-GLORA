import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AIAssistant } from '@/components/assistant/AIAssistant';
import { APP_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: `${APP_CONFIG.brandName} — Premium Handmade Crafts & Customized Gifts`,
  description:
    'Discover thoughtfully crafted handmade crafts, preserved botanical resin arts, bespoke name plaques, macramé wall hangings, and artisanal gifts.',
  keywords: [
    'handmade crafts',
    'resin flower',
    'customized gifts',
    'macrame wall hanging',
    'ceramic vase',
    'terrazzo candle holder',
    'Crafty Glora',
  ],
  authors: [{ name: 'Crafty Glora Studio' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: `${APP_CONFIG.brandName} — Handmade. Beautifully Yours.`,
    description:
      'Artisan handmade crafts, personalized gifts, and bespoke home accents lovingly sculpted by master artisans.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: APP_CONFIG.brandName,
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-craft-50 text-craft-900">
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <AIAssistant />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>

        {/* Razorpay Checkout SDK Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
