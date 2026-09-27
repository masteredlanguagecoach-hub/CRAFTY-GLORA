import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';
import {
  couponRepo,
  customerRepo,
  inventoryRepo,
  orderRepo,
  productRepo,
  syncOrderToGoogleSheets,
} from '@/lib/repositories/sheetRepositories';
import { OrderItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customer,
      items,
      breakdown,
      couponCode,
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing mandatory payment verification parameters' },
        { status: 400 }
      );
    }

    // 1. Strict Server-Side HMAC-SHA256 Signature Verification
    const isSignatureValid = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      console.warn(`Payment signature verification failed for order ${orderId}`);
      return NextResponse.json(
        {
          error:
            'Payment verification failed. Tampered or invalid signature. Order cannot be confirmed.',
        },
        { status: 400 }
      );
    }

    // 2. Prepare Order Items & Deduct Inventory
    const orderItems: OrderItem[] = [];
    const itemSummaries: string[] = [];

    for (const item of items) {
      const product = await productRepo.getById(item.productId);
      if (product) {
        // Deduct inventory
        await inventoryRepo.deductStock(product.id, item.quantity);

        orderItems.push({
          id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          orderId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: product.salePrice ?? product.price,
          discount: 0,
          finalPrice: (product.salePrice ?? product.price) * item.quantity,
          customization: item.customization,
          image: product.mainImage,
        });

        itemSummaries.push(`${item.quantity}x ${product.name}`);
      }
    }

    // 3. Upsert Customer in Customer Database
    let customerRecord = null;
    if (customer?.email) {
      customerRecord = await customerRepo.upsert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: `${customer.house}, ${customer.street}`,
        city: customer.city,
        district: customer.district || '',
        state: customer.state,
        pin: customer.pin,
        country: customer.country || 'India',
      });

      await customerRepo.recordOrder(customerRecord.id, breakdown.grandTotal);
    }

    // 4. Create Confirmed Paid Order
    const customizationDetails = orderItems
      .filter((i) => i.customization)
      .map(
        (i) =>
          `${i.productName}: [${Object.entries(i.customization || {})
            .map(([k, v]) => `${k}=${v}`)
            .join(', ')}]`
      )
      .join(' | ');

    const newOrder = await orderRepo.create({
      id: orderId,
      razorpayOrderId,
      razorpayPaymentId,
      customerId: customerRecord?.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      shippingAddress: {
        house: customer.house,
        street: customer.street,
        city: customer.city,
        district: customer.district || '',
        state: customer.state,
        pin: customer.pin,
        country: customer.country || 'India',
        deliveryInstructions: customer.deliveryInstructions || '',
        gstNumber: customer.gstNumber || '',
      },
      productSummary: itemSummaries.join(', '),
      items: orderItems,
      subtotal: breakdown.subtotal,
      discount: breakdown.discount,
      shipping: breakdown.shipping,
      tax: breakdown.tax,
      grandTotal: breakdown.grandTotal,
      paymentStatus: 'Success',
      orderStatus: 'Paid',
      customizationDetails,
      couponCode,
    });

    // 5. Asynchronously / Securely Sync to Google Sheets
    syncOrderToGoogleSheets(newOrder).catch((err) =>
      console.warn('Google Sheets background sync notice:', err)
    );

    // 6. Record Coupon Usage
    if (couponCode) {
      await couponRepo.recordUsage(couponCode);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('API /api/payment/verify error:', error);
    return NextResponse.json(
      { error: 'An error occurred while confirming your order' },
      { status: 500 }
    );
  }
}
