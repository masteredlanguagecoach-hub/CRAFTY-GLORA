import { NextRequest, NextResponse } from 'next/server';
import { productRepo } from '@/lib/repositories/sheetRepositories';
import { isCurrentUserAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    let products = await productRepo.getAll();

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (query) {
      const q = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.materials && p.materials.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newProduct = await productRepo.create({
      sku: body.sku || `CG-${Date.now().toString(36).toUpperCase()}`,
      name: body.name,
      slug,
      category: body.category,
      subcategory: body.subcategory || '',
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : undefined,
      stockQuantity: Number(body.stockQuantity ?? 10),
      lowStockThreshold: Number(body.lowStockThreshold ?? 3),
      status: body.status || 'Active',
      isFeatured: Boolean(body.isFeatured),
      isNewArrival: Boolean(body.isNewArrival),
      isBestSeller: Boolean(body.isBestSeller),
      isCustomizable: Boolean(body.isCustomizable),
      weight: body.weight || '',
      dimensions: body.dimensions || '',
      materials: body.materials || '',
      careInstructions: body.careInstructions || '',
      deliveryInfo: body.deliveryInfo || '',
      mainImage: body.mainImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      images: body.images || [],
      videoUrl: body.videoUrl || '',
      rating: 5.0,
      reviewsCount: 0,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('API POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
