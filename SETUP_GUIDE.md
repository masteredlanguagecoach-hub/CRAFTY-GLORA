# CRAFTY GLORA — PRODUCTION SETUP & INTEGRATION GUIDE

Welcome to **CRAFTY GLORA**, the premium artisan e-commerce web application for handmade crafts, preserved botanical resin arts, bespoke wood plaques, and customized gifts.

---

## 1. QUICK START (LOCAL DEVELOPMENT)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   - Customer Storefront: [http://localhost:3000](http://localhost:3000)
   - Admin Portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 2. DEFAULT ADMIN CREDENTIALS

| Field | Value |
|---|---|
| **Admin Email** | `admin@craftyglora.com` |
| **Admin Password** | `CraftyAdmin2026!#` |
| **Login URL** | `/admin/login` |

---

## 3. GOOGLE SHEETS AS PRIMARY DATABASE

Crafty Glora is engineered with a **Repository Pattern Layer** (`src/lib/repositories/`) that maps cleanly between the storefront and your Google Sheets database.

### 10-Sheet Structure:
1. **`PRODUCTS`**: Product ID, SKU, Product Name, Slug, Category, Subcategory, Description, Short Description, Price, Sale Price, Cost Price, Discount, Stock Quantity, Low Stock Threshold, Status, Featured, New Arrival, Best Seller, Customizable, Weight, Dimensions, Materials, Care Instructions, Delivery Information, Main Image, Image 2, Image 3, Image 4, Image 5, Video URL, Created Date, Updated Date
2. **`CATEGORIES`**: Category ID, Category Name, Slug, Description, Image URL, Display Order, Status
3. **`CUSTOMERS`**: Customer ID, Name, Email, Phone, Address, City, District, State, PIN, Country, Created Date, Last Order Date, Total Orders, Total Spent
4. **`ORDERS`**: Order ID, Razorpay Order ID, Razorpay Payment ID, Customer ID, Customer Name, Phone, Email, Address, City, District, State, PIN, Product Summary, Subtotal, Discount, Shipping, Tax, Grand Total, Payment Status, Order Status, Customization Details, Order Date, Updated Date
5. **`ORDER_ITEMS`**: Order Item ID, Order ID, Product ID, Product Name, SKU, Quantity, Unit Price, Discount, Final Price, Customization Details
6. **`PAYMENTS`**: Payment ID, Order ID, Razorpay Order ID, Razorpay Payment ID, Amount, Currency, Payment Method, Payment Status, Signature Verification, Payment Date
7. **`INVENTORY`**: Product ID, SKU, Product Name, Opening Stock, Current Stock, Reserved Stock, Sold Quantity, Low Stock Threshold, Stock Status, Last Updated
8. **`REVIEWS`**: Review ID, Product ID, Customer ID, Customer Name, Rating, Review, Images, Verified Purchase, Status, Created Date
9. **`COUPONS`**: Coupon Code, Discount Type, Discount Value, Minimum Order, Maximum Discount, Start Date, End Date, Usage Limit, Used Count, Status
10. **`SETTINGS`**: Key, Value, Description, Updated Date

### How to Connect Your Real Google Sheet:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Sheets API** and **Google Drive API**.
3. Create a **Service Account** under **IAM & Admin -> Service Accounts**.
4. Generate and download a new **JSON Private Key**.
5. Create a new Google Spreadsheet in your Google Drive.
6. Share the spreadsheet with your service account email (with **Editor** permissions).
7. Copy the Spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`).
8. Add the credentials to `.env.local`:
   ```env
   GOOGLE_SHEET_ID="your_spreadsheet_id_here"
   GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

*Note: If credentials are not supplied, Crafty Glora automatically operates on its fast, persistent local repository with 12+ preloaded handcrafted items so development and demonstrations work seamlessly out-of-the-box!*

---

## 4. RAZORPAY PAYMENT GATEWAY INTEGRATION

### Secure Payment Flow:
1. Customer reviews cart and proceeds to checkout.
2. Server validates cart item prices and stock in the database at `/api/payment/create` (never trusting frontend totals).
3. Server creates a Razorpay Order.
4. Razorpay Checkout modal opens on client side using `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
5. Upon payment completion, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
6. Client posts these to `/api/payment/verify`.
7. Server performs **HMAC-SHA256 signature verification** with `RAZORPAY_KEY_SECRET`.
8. Only when signature verification succeeds:
   - Order is confirmed and assigned a unique ID (`CG-YYYYMMDD-XXXX`)
   - Inventory is deducted in the database
   - Order is appended to `ORDERS`, `ORDER_ITEMS`, and `PAYMENTS` sheets
   - Customer is redirected to the verified Success Page with confetti and tracking timeline!

### Environment Variables:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_YourKeyIdHere"
RAZORPAY_KEY_SECRET="YourRazorpaySecretHere"
```
*(In sandbox mode without live keys, Crafty Glora includes a verified simulation test handler so the full end-to-end purchasing workflow can be tested immediately.)*

---

## 5. GOOGLE DRIVE ASSET STRUCTURE

```
CRAFTY GLORA (Google Drive Root Folder)
├── Products/
│   ├── CG-RES-FLW-01/
│   │   ├── Main.jpg
│   │   ├── Gallery-1.jpg
│   │   └── Video.mp4
│   └── CG-WOD-PLQ-02/
├── Categories/
├── Banners/
├── Reviews/
└── Marketing/
```

---

## 6. PRODUCTION BUILD VERIFICATION

To create an optimized production build:
```bash
npm run build
npm start
```
