import { NextRequest, NextResponse } from 'next/server';
import { orderRepo } from '@/lib/repositories/sheetRepositories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    let orders = await orderRepo.getAll();
    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId);
    }

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
