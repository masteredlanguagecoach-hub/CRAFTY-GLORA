import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import {
  productRepo,
  reviewRepo,
} from '@/lib/repositories/sheetRepositories';
import { APP_CONFIG } from '@/lib/config';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await productRepo.getBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | Crafty Glora' };

  return {
    title: `${product.name} | Crafty Glora Handmade`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Crafty Glora`,
      description: product.shortDescription,
      images: [
        {
          url: product.mainImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await productRepo.getBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const [allProducts, reviews] = await Promise.all([
    productRepo.getAll(),
    reviewRepo.getByProductId(product.id),
  ]);

  const relatedProducts = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  // JSON-LD Structured Data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.mainImage, ...(product.images || [])],
    description: product.shortDescription,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: APP_CONFIG.brandName,
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.salePrice ?? product.price,
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: Math.max(1, product.reviewsCount),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={reviews}
      />
    </>
  );
}
