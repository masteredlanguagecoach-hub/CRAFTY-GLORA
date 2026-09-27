import {
  Category,
  Coupon,
  Customer,
  InventoryItem,
  Order,
  OrderItem,
  PaymentRecord,
  Product,
  Review,
} from '@/types';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  getByCategory(categorySlug: string): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  create(category: Omit<Category, 'id'>): Promise<Category>;
  update(id: string, updates: Partial<Category>): Promise<Category | null>;
}

export interface IOrderRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  getByCustomerId(customerId: string): Promise<Order[]>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Order>;
  updateStatus(id: string, status: Order['orderStatus'], internalNotes?: string): Promise<Order | null>;
}

export interface ICustomerRepository {
  getAll(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  getByEmail(email: string): Promise<Customer | null>;
  upsert(customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer>;
  recordOrder(id: string, spentAmount: number): Promise<void>;
}

export interface IInventoryRepository {
  getAll(): Promise<InventoryItem[]>;
  getByProductId(productId: string): Promise<InventoryItem | null>;
  deductStock(productId: string, quantity: number): Promise<boolean>;
  updateStock(productId: string, currentStock: number, lowStockThreshold?: number): Promise<InventoryItem | null>;
}

export interface IReviewRepository {
  getByProductId(productId: string): Promise<Review[]>;
  getAll(): Promise<Review[]>;
  create(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
  updateStatus(id: string, status: Review['status']): Promise<Review | null>;
}

export interface ICouponRepository {
  getAll(): Promise<Coupon[]>;
  getByCode(code: string): Promise<Coupon | null>;
  validateCoupon(code: string, orderSubtotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon; discountAmount?: number }>;
  recordUsage(code: string): Promise<void>;
}
