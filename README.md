# CRAFTY GLORA — Premium Artisan E-Commerce Web App

**CRAFTY GLORA** is a production-ready, luxury e-commerce website designed specifically for handmade crafts, personalized keepsakes, preserved botanical resin arts, macramé tapestries, and ceramic home décor.

---

## 🌟 Key Highlights

- **Aesthetic Artisan Brand Identity**: Warm ivory, sand, cream, terracotta, and soft gold accents with editorial serif typography.
- **3D Interactive Hero Canvas**: Built using Three.js with real-time floating faceted crystalline objects, parallax mouse-tracking, and soft ambient lighting.
- **Full E-Commerce Journey**:
  - Catalogue & Collections with multi-criteria instant filtering (price range, categories, customization tags, in-stock).
  - Product Detail Page with high-res multi-image gallery, zoom, full specifications, care instructions, reviews submission, and custom personalization inputs (custom names, messages, color selections).
  - Sliding Cart Drawer & Full Cart Page with free shipping meter and coupon voucher engine.
  - Distraction-Free Checkout with customer delivery fields, GST support, and Razorpay integration.
- **Server-Side Razorpay Verification**: Secure HMAC-SHA256 signature verification ensuring payment authenticity.
- **Google Sheets 10-Sheet Database Architecture**: Repository pattern ready to sync directly with Google Sheets v4 API and Google Drive assets, with an out-of-the-box persistent local store.
- **Real-Time Order Tracking**: Visual progress timeline tracking orders from confirmation to delivery.
- **Secure Admin Management Portal**:
  - KPI cards (Sales, Today's Sales, AOV, Low Stock, Orders).
  - 7-day revenue trend chart.
  - Product management (Add, Edit, Delete, Duplicate, Stock).
  - Order status management with inspection modal.
  - Inventory alerts & threshold adjustments.
  - Customer directory with lifetime value metrics.
  - Coupons & Review moderation.
  - Google Sheets sync tester.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphism, Custom Luxury Color Palette
- **3D & Graphics**: Three.js, Canvas Confetti
- **Icons**: Lucide React
- **Payments**: Razorpay SDK & Server-side Verification
- **Database**: Google Sheets API v4 with Repository Layer Abstraction & Local Persistent Store

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

- Storefront: `http://localhost:3000`
- Admin Portal: `http://localhost:3000/admin/login` (User: `admin@craftyglora.com`, Pass: `CraftyAdmin2026!#`)
