import { NextRequest, NextResponse } from 'next/server';
import { categoryRepo } from '@/lib/repositories/sheetRepositories';
import { isCurrentUserAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await categoryRepo.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newCategory = await categoryRepo.create({
      name: body.name,
      slug,
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      displayOrder: body.displayOrder || 99,
      status: body.status || 'Active',
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
