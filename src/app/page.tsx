import { Hero3D } from '@/components/home/Hero3D';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandStory } from '@/components/home/BrandStory';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { categoryRepo, productRepo } from '@/lib/repositories/sheetRepositories';

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    categoryRepo.getAll(),
    productRepo.getAll(),
  ]);

  return (
    <div className="flex flex-col">
      {/* 3D Hero Section */}
      <Hero3D />

      {/* Featured Collections / Categories */}
      <CategorySection categories={categories} />

      {/* Featured Products Showcase */}
      <FeaturedProducts products={products} />

      {/* Brand Story & Craft Ethos */}
      <BrandStory />

      {/* Customer Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
