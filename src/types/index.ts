export type OrderStatus =
  | 'Payment Pending'
  | 'Paid'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus =
  | 'Pending'
  | 'Success'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface CustomizationOption {
  recipientName?: string;
  customMessage?: string;
  colorPreference?: string;
  size?: string;
  customText?: string;
  specialInstructions?: string;
  referenceImageUrl?: string;
}

export interface Product {
  id: string; // Product ID
  sku: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: 'Active' | 'Draft' | 'Archived';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isCustomizable: boolean;
  weight?: string;
  dimensions?: string;
  materials?: string;
  careInstructions?: string;
  deliveryInfo?: string;
  mainImage: string;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pin: string;
  country: string;
  createdAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
  customization?: CustomizationOption;
  image?: string;
}

export interface Order {
  id: string; // e.g. CG-20260928-0001
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    house: string;
    street: string;
    city: string;
    district: string;
    state: string;
    pin: string;
    country: string;
    deliveryInstructions?: string;
    gstNumber?: string;
  };
  productSummary: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customizationDetails?: string;
  couponCode?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  signatureVerified: boolean;
  paymentDate: string;
}

export interface InventoryItem {
  productId: string;
  sku: string;
  productName: string;
  openingStock: number;
  currentStock: number;
  reservedStock: number;
  soldQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  lastUpdated: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId?: string;
  customerName: string;
  rating: number;
  review: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Expired' | 'Disabled';
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: CustomizationOption;
  selectedPrice: number;
}
