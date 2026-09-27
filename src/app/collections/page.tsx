import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categoryRepo, productRepo } from '@/lib/repositories/sheetRepositories';

export const metadata = {
  title: 'Artisan Collections & Craft Disciplines | Crafty Glora',
  description: 'Explore all artisan disciplines curated at Crafty Glora Studio.',
};

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    categoryRepo.getAll(),
    productRepo.getAll(),
  ]);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Craft Disciplines</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-craft-950">
          Artisan Collections
        </h1>
        <p className="text-sm text-stone-600 mt-3 font-normal">
          Each collection honors traditional artisanal heritage, bespoke customized touches, and contemporary craftsmanship.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length;

          return (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group rounded-3xl overflow-hidden bg-cream border border-craft-200 shadow-soft hover:shadow-floating transition-all duration-500 flex flex-col"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-sand/40">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-craft-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {count} piece{count === 1 ? '' : 's'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-medium text-craft-950 group-hover:text-gold-dark transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-craft-200/60 flex items-center justify-between text-xs font-semibold text-craft-900 group-hover:text-gold-dark">
                  <span>Explore this collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
