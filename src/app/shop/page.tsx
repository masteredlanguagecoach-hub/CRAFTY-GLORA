import { Suspense } from 'react';
import { ShopClient } from '@/components/shop/ShopClient';
import { categoryRepo, productRepo } from '@/lib/repositories/sheetRepositories';

export const revalidate = 60;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    productRepo.getAll(),
    categoryRepo.getAll(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-xs text-stone-500">Loading catalog...</div>}>
      <ShopClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
