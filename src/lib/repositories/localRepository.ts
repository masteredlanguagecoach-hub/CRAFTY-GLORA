import fs from 'fs';
import path from 'path';
import {
  Category,
  Coupon,
  Customer,
  InventoryItem,
  Order,
  PaymentRecord,
  Product,
  Review,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
} from '@/lib/db/initialData';
import {
  ICategoryRepository,
  ICouponRepository,
  ICustomerRepository,
  IInventoryRepository,
  IOrderRepository,
  IProductRepository,
  IReviewRepository,
} from './types';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  payments: PaymentRecord[];
  inventory: InventoryItem[];
  reviews: Review[];
  coupons: Coupon[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'craftyglora.json');

// Initialize database in-memory and write to file
let memoryDb: DatabaseSchema | null = null;

function getInitialDatabase(): DatabaseSchema {
  const products = [...INITIAL_PRODUCTS];
  const categories = [...INITIAL_CATEGORIES];
  const coupons = [...INITIAL_COUPONS];
  const reviews = [...INITIAL_REVIEWS];

  const inventory: InventoryItem[] = products.map((p) => ({
    productId: p.id,
    sku: p.sku,
    productName: p.name,
    openingStock: p.stockQuantity + 5,
    currentStock: p.stockQuantity,
    reservedStock: 0,
    soldQuantity: 5,
    lowStockThreshold: p.lowStockThreshold,
    stockStatus:
      p.stockQuantity === 0
        ? 'Out of Stock'
        : p.stockQuantity <= p.lowStockThreshold
        ? 'Low Stock'
        : 'In Stock',
    lastUpdated: new Date().toISOString(),
  }));

  const demoCustomer: Customer = {
    id: 'cust-demo-1',
    name: 'Priyanka Sen',
    email: 'priyanka.demo@craftyglora.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Lotus Orchid, Palm Beach Road',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    pin: '400706',
    country: 'India',
    createdAt: '2026-08-01T10:00:00Z',
    lastOrderDate: '2026-09-20T12:00:00Z',
    totalOrders: 1,
    totalSpent: 1798,
  };

  const demoOrder: Order = {
    id: 'CG-20260920-0042',
    razorpayOrderId: 'order_demo_100234',
    razorpayPaymentId: 'pay_demo_982341',
    customerId: demoCustomer.id,
    customerName: demoCustomer.name,
    customerPhone: demoCustomer.phone,
    customerEmail: demoCustomer.email,
    shippingAddress: {
      house: 'Flat 402',
      street: 'Lotus Orchid, Palm Beach Road',
      city: demoCustomer.city,
      district: demoCustomer.district,
      state: demoCustomer.state,
      pin: demoCustomer.pin,
      country: demoCustomer.country,
      deliveryInstructions: 'Ring doorbell twice. Fragile craft item.',
    },
    productSummary: '1x Handmade Botanical Resin Flower Display, 1x Gilded Ocean Geode Resin Coasters',
    items: [
      {
        id: 'item-001',
        orderId: 'CG-20260920-0042',
        productId: 'prod-001',
        productName: 'Handmade Botanical Resin Flower Display',
        sku: 'CG-RES-FLW-01',
        quantity: 1,
        unitPrice: 899,
        discount: 0,
        finalPrice: 899,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        customization: {
          recipientName: 'Priyanka & Arjun',
          customMessage: 'Together forever in bloom',
        },
      },
    ],
    subtotal: 899,
    discount: 0,
    shipping: 0,
    tax: 45,
    grandTotal: 944,
    paymentStatus: 'Success',
    orderStatus: 'Shipped',
    customizationDetails: 'Name: Priyanka & Arjun | Note: Together forever in bloom',
    createdAt: '2026-09-20T12:00:00Z',
    updatedAt: '2026-09-22T14:00:00Z',
  };

  return {
    products,
    categories,
    customers: [demoCustomer],
    orders: [demoOrder],
    payments: [
      {
        id: 'pay-rec-001',
        orderId: demoOrder.id,
        razorpayOrderId: demoOrder.razorpayOrderId || '',
        razorpayPaymentId: demoOrder.razorpayPaymentId || '',
        amount: demoOrder.grandTotal,
        currency: 'INR',
        paymentMethod: 'UPI',
        paymentStatus: 'Success',
        signatureVerified: true,
        paymentDate: demoOrder.createdAt,
      },
    ],
    inventory,
    reviews,
    coupons,
  };
}

function loadDatabase(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb!;
    }
  } catch (err) {
    console.warn('Failed to load .data/craftyglora.json, using defaults', err);
  }

  memoryDb = getInitialDatabase();
  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to .data/craftyglora.json:', err);
  }
}

// -----------------------------------------------------------------------------
// PRODUCT REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const db = loadDatabase();
    return db.products;
  }

  async getById(id: string): Promise<Product | null> {
    const db = loadDatabase();
    return db.products.find((p) => p.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const db = loadDatabase();
    return db.products.find((p) => p.slug === slug) || null;
  }

  async getByCategory(categoryNameOrSlug: string): Promise<Product[]> {
    const db = loadDatabase();
    const cat = db.categories.find(
      (c) =>
        c.slug.toLowerCase() === categoryNameOrSlug.toLowerCase() ||
        c.name.toLowerCase() === categoryNameOrSlug.toLowerCase()
    );
    const categoryName = cat ? cat.name : categoryNameOrSlug;
    return db.products.filter(
      (p) => p.category.toLowerCase() === categoryName.toLowerCase()
    );
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const db = loadDatabase();
    const id = `prod-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    db.products.unshift(newProduct);

    // Also add to inventory
    db.inventory.unshift({
      productId: id,
      sku: newProduct.sku,
      productName: newProduct.name,
      openingStock: newProduct.stockQuantity,
      currentStock: newProduct.stockQuantity,
      reservedStock: 0,
      soldQuantity: 0,
      lowStockThreshold: newProduct.lowStockThreshold || 3,
      stockStatus: newProduct.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
      lastUpdated: now,
    });

    saveDatabase(db);
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const db = loadDatabase();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    db.products[index] = {
      ...db.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep inventory in sync
    const invIndex = db.inventory.findIndex((i) => i.productId === id);
    if (invIndex !== -1 && updates.stockQuantity !== undefined) {
      db.inventory[invIndex].currentStock = updates.stockQuantity;
      db.inventory[invIndex].stockStatus =
        updates.stockQuantity === 0
          ? 'Out of Stock'
          : updates.stockQuantity <= db.inventory[invIndex].lowStockThreshold
          ? 'Low Stock'
          : 'In Stock';
      db.inventory[invIndex].lastUpdated = new Date().toISOString();
    }

    saveDatabase(db);
    return db.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const db = loadDatabase();
    const initialLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    db.inventory = db.inventory.filter((i) => i.productId !== id);
    saveDatabase(db);
    return db.products.length < initialLength;
  }
}

// -----------------------------------------------------------------------------
// CATEGORY REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = loadDatabase();
    return db.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getById(id: string): Promise<Category | null> {
    const db = loadDatabase();
    return db.categories.find((c) => c.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const db = loadDatabase();
    return db.categories.find((c) => c.slug === slug) || null;
  }

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    const db = loadDatabase();
    const id = `cat-${Date.now().toString(36)}`;
    const newCategory: Category = { ...data, id };
    db.categories.push(newCategory);
    saveDatabase(db);
    return newCategory;
  }

  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const db = loadDatabase();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    db.categories[index] = { ...db.categories[index], ...updates };
    saveDatabase(db);
    return db.categories[index];
  }
}

// -----------------------------------------------------------------------------
// ORDER REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalOrderRepository implements IOrderRepository {
  async getAll(): Promise<Order[]> {
    const db = loadDatabase();
    return [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<Order | null> {
    const db = loadDatabase();
    return db.orders.find((o) => o.id === id) || null;
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    const db = loadDatabase();
    return db.orders.filter((o) => o.customerId === customerId);
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Order> {
    const db = loadDatabase();
    const id = data.id || `CG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    db.orders.unshift(newOrder);

    // If order has payment details, record payment
    if (data.razorpayPaymentId) {
      db.payments.unshift({
        id: `pay-${Date.now().toString(36)}`,
        orderId: id,
        razorpayOrderId: data.razorpayOrderId || '',
        razorpayPaymentId: data.razorpayPaymentId,
        amount: data.grandTotal,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        paymentStatus: data.paymentStatus,
        signatureVerified: true,
        paymentDate: now,
      });
    }

    saveDatabase(db);
    return newOrder;
  }

  async updateStatus(
    id: string,
    status: Order['orderStatus'],
    internalNotes?: string
  ): Promise<Order | null> {
    const db = loadDatabase();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    db.orders[index].orderStatus = status;
    db.orders[index].updatedAt = new Date().toISOString();
    if (internalNotes) {
      db.orders[index].internalNotes = internalNotes;
    }
    saveDatabase(db);
    return db.orders[index];
  }
}

// -----------------------------------------------------------------------------
// CUSTOMER REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalCustomerRepository implements ICustomerRepository {
  async getAll(): Promise<Customer[]> {
    const db = loadDatabase();
    return db.customers;
  }

  async getById(id: string): Promise<Customer | null> {
    const db = loadDatabase();
    return db.customers.find((c) => c.id === id) || null;
  }

  async getByEmail(email: string): Promise<Customer | null> {
    const db = loadDatabase();
    return db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async upsert(data: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
    const db = loadDatabase();
    const existingIndex = db.customers.findIndex(
      (c) => c.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingIndex !== -1) {
      db.customers[existingIndex] = {
        ...db.customers[existingIndex],
        ...data,
      };
      saveDatabase(db);
      return db.customers[existingIndex];
    } else {
      const newCustomer: Customer = {
        ...data,
        id: `cust-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
      };
      db.customers.push(newCustomer);
      saveDatabase(db);
      return newCustomer;
    }
  }

  async recordOrder(id: string, spentAmount: number): Promise<void> {
    const db = loadDatabase();
    const customer = db.customers.find((c) => c.id === id);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += spentAmount;
      customer.lastOrderDate = new Date().toISOString();
      saveDatabase(db);
    }
  }
}

// -----------------------------------------------------------------------------
// INVENTORY REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalInventoryRepository implements IInventoryRepository {
  async getAll(): Promise<InventoryItem[]> {
    const db = loadDatabase();
    return db.inventory;
  }

  async getByProductId(productId: string): Promise<InventoryItem | null> {
    const db = loadDatabase();
    return db.inventory.find((i) => i.productId === productId) || null;
  }

  async deductStock(productId: string, quantity: number): Promise<boolean> {
    const db = loadDatabase();
    const product = db.products.find((p) => p.id === productId);
    const item = db.inventory.find((i) => i.productId === productId);

    if (!product || !item) return false;
    if (item.currentStock < quantity) return false;

    item.currentStock -= quantity;
    item.soldQuantity += quantity;
    item.stockStatus =
      item.currentStock === 0
        ? 'Out of Stock'
        : item.currentStock <= item.lowStockThreshold
        ? 'Low Stock'
        : 'In Stock';
    item.lastUpdated = new Date().toISOString();

    product.stockQuantity = item.currentStock;
    product.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return true;
  }

  async updateStock(
    productId: string,
    currentStock: number,
    lowStockThreshold?: number
  ): Promise<InventoryItem | null> {
    const db = loadDatabase();
    const product = db.products.find((p) => p.id === productId);
    const item = db.inventory.find((i) => i.productId === productId);
    if (!item) return null;

    item.currentStock = currentStock;
    if (lowStockThreshold !== undefined) {
      item.lowStockThreshold = lowStockThreshold;
    }
    item.stockStatus =
      item.currentStock === 0
        ? 'Out of Stock'
        : item.currentStock <= item.lowStockThreshold
        ? 'Low Stock'
        : 'In Stock';
    item.lastUpdated = new Date().toISOString();

    if (product) {
      product.stockQuantity = currentStock;
      if (lowStockThreshold !== undefined) {
        product.lowStockThreshold = lowStockThreshold;
      }
      product.updatedAt = new Date().toISOString();
    }

    saveDatabase(db);
    return item;
  }
}

// -----------------------------------------------------------------------------
// REVIEW REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalReviewRepository implements IReviewRepository {
  async getByProductId(productId: string): Promise<Review[]> {
    const db = loadDatabase();
    return db.reviews.filter((r) => r.productId === productId && r.status === 'Approved');
  }

  async getAll(): Promise<Review[]> {
    const db = loadDatabase();
    return db.reviews;
  }

  async create(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const db = loadDatabase();
    const newReview: Review = {
      ...data,
      id: `rev-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    db.reviews.unshift(newReview);

    // Update product rating and reviewsCount
    const productReviews = db.reviews.filter(
      (r) => r.productId === data.productId && r.status === 'Approved'
    );
    const product = db.products.find((p) => p.id === data.productId);
    if (product && productReviews.length > 0) {
      const avg =
        productReviews.reduce((acc, curr) => acc + curr.rating, 0) /
        productReviews.length;
      product.rating = Number(avg.toFixed(1));
      product.reviewsCount = productReviews.length;
    }

    saveDatabase(db);
    return newReview;
  }

  async updateStatus(id: string, status: Review['status']): Promise<Review | null> {
    const db = loadDatabase();
    const review = db.reviews.find((r) => r.id === id);
    if (!review) return null;
    review.status = status;
    saveDatabase(db);
    return review;
  }
}

// -----------------------------------------------------------------------------
// COUPON REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class LocalCouponRepository implements ICouponRepository {
  async getAll(): Promise<Coupon[]> {
    const db = loadDatabase();
    return db.coupons;
  }

  async getByCode(code: string): Promise<Coupon | null> {
    const db = loadDatabase();
    return (
      db.coupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.status === 'Active'
      ) || null
    );
  }

  async validateCoupon(
    code: string,
    orderSubtotal: number
  ): Promise<{ valid: boolean; message?: string; coupon?: Coupon; discountAmount?: number }> {
    const coupon = await this.getByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }

    if (orderSubtotal < coupon.minimumOrder) {
      return {
        valid: false,
        message: `Order must be at least ₹${coupon.minimumOrder} to apply ${coupon.code}`,
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon usage limit has been reached' };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return {
      valid: true,
      coupon,
      discountAmount,
      message: `Coupon ${coupon.code} applied! Saved ₹${discountAmount}`,
    };
  }

  async recordUsage(code: string): Promise<void> {
    const db = loadDatabase();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.usedCount += 1;
      saveDatabase(db);
    }
  }
}
