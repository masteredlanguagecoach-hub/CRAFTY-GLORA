import { NextRequest, NextResponse } from 'next/server';
import { orderRepo } from '@/lib/repositories/sheetRepositories';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const order = await orderRepo.getById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { status, internalNotes } = body;

    const updated = await orderRepo.updateStatus(params.id, status, internalNotes);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
