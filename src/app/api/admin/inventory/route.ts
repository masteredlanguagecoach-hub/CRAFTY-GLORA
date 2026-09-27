import { NextRequest, NextResponse } from 'next/server';
import { inventoryRepo } from '@/lib/repositories/sheetRepositories';
import { isCurrentUserAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const items = await inventoryRepo.getAll();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, currentStock, lowStockThreshold } = await req.json();

    if (!productId || currentStock === undefined) {
      return NextResponse.json(
        { error: 'Product ID and currentStock are required' },
        { status: 400 }
      );
    }

    const updated = await inventoryRepo.updateStock(
      productId,
      Number(currentStock),
      lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined
    );

    if (!updated) {
      return NextResponse.json({ error: 'Product not found in inventory' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
