import { NextRequest, NextResponse } from 'next/server';
import { couponRepo } from '@/lib/repositories/sheetRepositories';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Please provide a coupon code' },
        { status: 400 }
      );
    }

    const result = await couponRepo.validateCoupon(code, Number(subtotal || 0));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
