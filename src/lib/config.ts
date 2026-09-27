export const APP_CONFIG = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Crafty Glora',
  tagline: 'Made by Hand. Made to Matter.',
  heroHeadline: 'Handmade. Beautifully Yours.',
  heroSubheadline:
    'Discover thoughtfully crafted pieces made to bring creativity, warmth, and character into your world.',
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'INR',
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@craftyglora.com',
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  taxRatePercentage: 5, // 5% GST on artisan handicrafts
};

export const formatPrice = (amount: number): string => {
  return `${APP_CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`;
};

export const generateOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CG-${year}${month}${day}-${randomSuffix}`;
};
