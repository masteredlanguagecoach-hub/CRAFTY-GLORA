import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ShopClient } from '@/components/shop/ShopClient';
import { categoryRepo, productRepo } from '@/lib/repositories/sheetRepositories';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await categoryRepo.getBySlug(params.category);
  if (!category) return { title: 'Collection | Crafty Glora' };

  return {
    title: `${category.name} Collection | Crafty Glora`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [products, categories, currentCategory] = await Promise.all([
    productRepo.getAll(),
    categoryRepo.getAll(),
    categoryRepo.getBySlug(params.category),
  ]);

  if (!currentCategory) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-xs text-stone-500">Loading collection...</div>}>
      <ShopClient
        initialProducts={products}
        categories={categories}
        initialCategorySlug={params.category}
      />
    </Suspense>
  );
}
