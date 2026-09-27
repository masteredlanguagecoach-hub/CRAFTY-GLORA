import { NextResponse } from 'next/server';
import {
  customerRepo,
  inventoryRepo,
  orderRepo,
  productRepo,
} from '@/lib/repositories/sheetRepositories';
import { googleSheets } from '@/lib/sheets/googleSheetsClient';

export async function GET() {
  try {
    const [orders, products, customers, inventory] = await Promise.all([
      orderRepo.getAll(),
      productRepo.getAll(),
      customerRepo.getAll(),
      inventoryRepo.getAll(),
    ]);

    // Financial calculations
    const validOrders = orders.filter(
      (o) => o.paymentStatus === 'Success' || o.orderStatus === 'Paid' || o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped'
    );

    const totalSales = validOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const averageOrderValue =
      validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = validOrders
      .filter((o) => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = validOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Status breakdowns
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === 'Payment Pending' || o.orderStatus === 'Paid' || o.orderStatus === 'Processing'
    ).length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;

    // Low stock items
    const lowStockItems = inventory.filter(
      (i) => i.currentStock <= i.lowStockThreshold || i.currentStock === 0
    );

    // Best Selling Products
    const bestSellingProducts = products.filter((p) => p.isBestSeller).slice(0, 5);

    // 7-day sales breakdown chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRevenue = validOrders
        .filter((o) => o.createdAt.startsWith(dateKey))
        .reduce((sum, o) => sum + o.grandTotal, 0);

      last7Days.push({
        date: dateKey,
        day: dayName,
        revenue: dayRevenue,
      });
    }

    return NextResponse.json({
      totalSales,
      todaySales,
      monthlySales,
      averageOrderValue,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      bestSellingProducts,
      recentOrders: orders.slice(0, 6),
      salesChart: last7Days,
      googleSheetsConfigured: googleSheets.isConfigured(),
    });
  } catch (error) {
    console.error('API /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Failed to aggregate statistics' }, { status: 500 });
  }
}
