import {
  LocalCategoryRepository,
  LocalCouponRepository,
  LocalCustomerRepository,
  LocalInventoryRepository,
  LocalOrderRepository,
  LocalProductRepository,
  LocalReviewRepository,
} from './localRepository';
import { googleSheets } from '../sheets/googleSheetsClient';
import { Order, Product, Customer } from '@/types';

// Instantiate local base repositories
export const productRepo = new LocalProductRepository();
export const categoryRepo = new LocalCategoryRepository();
export const orderRepo = new LocalOrderRepository();
export const customerRepo = new LocalCustomerRepository();
export const inventoryRepo = new LocalInventoryRepository();
export const reviewRepo = new LocalReviewRepository();
export const couponRepo = new LocalCouponRepository();

/**
 * Sync an order to Google Sheets if credentials are configured
 */
export async function syncOrderToGoogleSheets(order: Order): Promise<boolean> {
  if (!googleSheets.isConfigured()) {
    return false;
  }

  try {
    // Columns specified in Prompt for ORDERS:
    // Order ID, Razorpay Order ID, Razorpay Payment ID, Customer ID, Customer Name, Phone, Email,
    // Address, City, District, State, PIN, Product Summary, Subtotal, Discount, Shipping, Tax,
    // Grand Total, Payment Status, Order Status, Customization Details, Order Date, Updated Date
    const row = [
      order.id,
      order.razorpayOrderId || '',
      order.razorpayPaymentId || '',
      order.customerId || '',
      order.customerName,
      order.customerPhone,
      order.customerEmail,
      `${order.shippingAddress.house}, ${order.shippingAddress.street}`,
      order.shippingAddress.city,
      order.shippingAddress.district,
      order.shippingAddress.state,
      order.shippingAddress.pin,
      order.productSummary,
      order.subtotal,
      order.discount,
      order.shipping,
      order.tax,
      order.grandTotal,
      order.paymentStatus,
      order.orderStatus,
      order.customizationDetails || '',
      order.createdAt,
      order.updatedAt,
    ];

    await googleSheets.appendRow('ORDERS', row);

    // Also append each item to ORDER_ITEMS:
    // Order Item ID, Order ID, Product ID, Product Name, SKU, Quantity, Unit Price, Discount, Final Price, Customization Details
    for (const item of order.items) {
      const itemRow = [
        item.id,
        order.id,
        item.productId,
        item.productName,
        item.sku,
        item.quantity,
        item.unitPrice,
        item.discount,
        item.finalPrice,
        item.customization ? JSON.stringify(item.customization) : '',
      ];
      await googleSheets.appendRow('ORDER_ITEMS', itemRow);
    }

    // Append to PAYMENTS sheet if payment ID exists:
    // Payment ID, Order ID, Razorpay Order ID, Razorpay Payment ID, Amount, Currency, Payment Method, Payment Status, Signature Verification, Payment Date
    if (order.razorpayPaymentId) {
      const payRow = [
        `pay-${order.id}`,
        order.id,
        order.razorpayOrderId || '',
        order.razorpayPaymentId,
        order.grandTotal,
        'INR',
        'Razorpay',
        order.paymentStatus,
        'Verified',
        order.createdAt,
      ];
      await googleSheets.appendRow('PAYMENTS', payRow);
    }

    return true;
  } catch (err) {
    console.error('Failed to sync order to Google Sheets:', err);
    return false;
  }
}
