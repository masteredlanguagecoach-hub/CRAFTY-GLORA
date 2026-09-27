import { NextRequest, NextResponse } from 'next/server';
import { reviewRepo } from '@/lib/repositories/sheetRepositories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const reviews = productId
      ? await reviewRepo.getByProductId(productId)
      : await reviewRepo.getAll();

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, customerName, rating, review, isVerifiedPurchase } = body;

    if (!productId || !customerName || !review) {
      return NextResponse.json(
        { error: 'Product ID, customer name, and review are required' },
        { status: 400 }
      );
    }

    const created = await reviewRepo.create({
      productId,
      customerName,
      rating: Number(rating || 5),
      review,
      isVerifiedPurchase: Boolean(isVerifiedPurchase),
      status: 'Approved',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
