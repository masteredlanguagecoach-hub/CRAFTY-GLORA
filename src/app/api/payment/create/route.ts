import { NextRequest, NextResponse } from 'next/server';
import {
  couponRepo,
  productRepo,
} from '@/lib/repositories/sheetRepositories';
import { razorpayService } from '@/lib/razorpay';
import { APP_CONFIG, generateOrderId } from '@/lib/config';

interface CartInputItem {
  productId: string;
  quantity: number;
  customization?: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. Please select products to purchase.' },
        { status: 400 }
      );
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Verify every item against database (NEVER trust frontend price)
    for (const item of items as CartInputItem[]) {
      const product = await productRepo.getById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found (ID: ${item.productId})` },
          { status: 404 }
        );
      }

      // Check stock quantity
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `"${product.name}" only has ${product.stockQuantity} pieces available in the studio.`,
          },
          { status: 400 }
        );
      }

      const unitPrice = product.salePrice ?? product.price;
      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        customization: item.customization,
      });
    }

    // Coupon calculation
    let discountAmount = 0;
    if (couponCode) {
      const couponCheck = await couponRepo.validateCoupon(
        couponCode,
        calculatedSubtotal
      );
      if (couponCheck.valid && couponCheck.discountAmount) {
        discountAmount = couponCheck.discountAmount;
      }
    }

    const afterDiscount = Math.max(0, calculatedSubtotal - discountAmount);
    const shippingFee =
      calculatedSubtotal >= APP_CONFIG.freeShippingThreshold
        ? 0
        : APP_CONFIG.standardShippingFee;
    const taxAmount = Math.round(
      (afterDiscount * APP_CONFIG.taxRatePercentage) / 100
    );
    const finalGrandTotal = Math.max(0, afterDiscount + shippingFee + taxAmount);

    const orderId = generateOrderId();

    // Call Razorpay Order Creation
    const rzpOrder = await razorpayService.createOrder(finalGrandTotal, orderId, {
      orderId,
      customerEmail: customerInfo?.email || '',
    });

    return NextResponse.json({
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      amountInRupees: finalGrandTotal,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_craftyglora_demo',
      isMock: rzpOrder.isMock,
      breakdown: {
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shipping: shippingFee,
        tax: taxAmount,
        grandTotal: finalGrandTotal,
      },
    });
  } catch (error) {
    console.error('API /api/payment/create error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate secure checkout order' },
      { status: 500 }
    );
  }
}
