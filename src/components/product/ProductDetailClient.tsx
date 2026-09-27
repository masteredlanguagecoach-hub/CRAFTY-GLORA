'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Upload,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { CustomizationOption, Product, Review } from '@/types';
import { APP_CONFIG, formatPrice } from '@/lib/config';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { ProductCard } from './ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews: Review[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts,
  initialReviews,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'description' | 'materials' | 'care' | 'delivery' | 'reviews' | 'faqs'
  >('description');

  // Customization state
  const [customization, setCustomization] = useState<CustomizationOption>({
    recipientName: '',
    customMessage: '',
    colorPreference: '',
    customText: '',
    specialInstructions: '',
  });

  // Review submission state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const effectivePrice = product.salePrice ?? product.price;
  const gallery = [product.mainImage, ...(product.images || [])];

  const handleAddToCart = () => {
    addToCart(product, quantity, product.isCustomizable ? customization : undefined);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, product.isCustomizable ? customization : undefined);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) {
      showToast('Please provide your name and review', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: newReviewName,
          rating: newReviewRating,
          review: newReviewText,
          isVerifiedPurchase: true,
        }),
      });

      if (res.ok) {
        const createdReview = await res.json();
        setReviews([createdReview, ...reviews]);
        setNewReviewName('');
        setNewReviewText('');
        showToast('Review submitted with reverence! Thank you.', 'success');
      } else {
        showToast('Failed to post review', 'error');
      }
    } catch {
      showToast('Network error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard', 'info');
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500 mb-8 font-medium">
        <Link href="/" className="hover:text-craft-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-craft-900 transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
          className="hover:text-craft-900 transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-craft-950 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-sand/40 border border-craft-200 shadow-soft">
            <Image
              src={gallery[selectedImage] || product.mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-craft-900 text-gold-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  {product.discountPercentage}% OFF
                </span>
              )}
              {product.isCustomizable && (
                <span className="bg-white/95 text-craft-900 border border-craft-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  Customizable
                </span>
              )}
            </div>

            {/* Share & Wishlist quick buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`p-3 rounded-full transition-all shadow-xs ${
                  isFavorited
                    ? 'bg-red-50 text-red-500'
                    : 'bg-white/90 text-stone-700 hover:text-red-500 hover:bg-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/90 text-stone-700 hover:text-craft-900 hover:bg-white shadow-xs transition-colors"
                title="Share piece"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails row */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx
                      ? 'border-gold shadow-xs scale-95'
                      : 'border-craft-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600">
                {product.category}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] font-mono text-stone-500">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950 leading-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-gold'
                        : 'fill-stone-200 text-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-craft-900">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-stone-500">
                ({product.reviewsCount} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-cream border border-craft-200 shadow-xs flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-craft-950">
              {formatPrice(effectivePrice)}
            </span>
            {product.salePrice && (
              <span className="text-base text-stone-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-1 rounded-full ml-auto">
              Inclusive of all taxes
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            {product.shortDescription}
          </p>

          {/* Customization Section if enabled */}
          {product.isCustomizable && (
            <div className="p-5 rounded-2xl bg-sand/40 border border-craft-300 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-craft-900">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Personalize Your Piece</span>
              </div>
              <p className="text-xs text-stone-500">
                Provide custom details below. Our artisan will handcraft this according to your specifications.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                    Recipient Name / Initials
                  </label>
                  <input
                    type="text"
                    value={customization.recipientName}
                    onChange={(e) =>
                      setCustomization({ ...customization, recipientName: e.target.value })
                    }
                    placeholder="e.g. Priyanka & Arjun"
                    className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                    Custom Message or Inscription
                  </label>
                  <input
                    type="text"
                    value={customization.customMessage}
                    onChange={(e) =>
                      setCustomization({ ...customization, customMessage: e.target.value })
                    }
                    placeholder="e.g. In bloom forever (Max 60 chars)"
                    className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                      Color Preference
                    </label>
                    <input
                      type="text"
                      value={customization.colorPreference}
                      onChange={(e) =>
                        setCustomization({ ...customization, colorPreference: e.target.value })
                      }
                      placeholder="e.g. Gold Foil & Cream"
                      className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                      Special Notes
                    </label>
                    <input
                      type="text"
                      value={customization.specialInstructions}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          specialInstructions: e.target.value,
                        })
                      }
                      placeholder="e.g. Anniversary gift"
                      className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Status */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-craft-900 uppercase tracking-wider">
                Quantity
              </span>
              <span className="text-xs text-stone-500">
                {product.stockQuantity > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    In Stock ({product.stockQuantity} ready to dispatch)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Sold Out</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-craft-300 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-stone-100 text-stone-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 text-sm font-bold text-craft-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="p-3 hover:bg-stone-100 text-stone-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-4 px-6 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-40 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              className="w-full py-4 px-6 rounded-xl bg-gold hover:bg-gold-light text-craft-950 text-xs uppercase tracking-widest font-bold shadow-soft hover:shadow-card transition-all"
            >
              Buy It Now with 1-Click
            </button>
          </div>

          {/* WhatsApp Direct Inquiry Button */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                `Hello Crafty Glora! I'm inquiring about "${product.name}" (SKU: ${product.sku}). Can you share more details or custom options?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl border border-emerald-500/40 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 transition-colors text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask about this piece on WhatsApp</span>
            </a>
          </div>

          {/* Quick Assurance Badges */}
          <div className="pt-4 border-t border-craft-200 grid grid-cols-3 gap-3 text-center text-[11px] text-stone-600">
            <div className="p-2.5 rounded-xl bg-cream border border-craft-200/80">
              <Truck className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>Insured Shipping</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cream border border-craft-200/80">
              <ShieldCheck className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>Authentic Craft</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cream border border-craft-200/80">
              <RotateCcw className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>7-Day Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Materials, Care, Delivery, Reviews, FAQs */}
      <div className="mb-20">
        <div className="flex border-b border-craft-200 overflow-x-auto gap-4 sm:gap-8">
          {[
            { id: 'description', label: 'Artisan Description' },
            { id: 'materials', label: 'Materials & Dimensions' },
            { id: 'care', label: 'Care Instructions' },
            { id: 'delivery', label: 'Delivery & Returns' },
            { id: 'reviews', label: `Patron Reviews (${reviews.length})` },
            { id: 'faqs', label: 'FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-craft-950 font-bold'
                  : 'text-stone-500 hover:text-craft-900'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="py-8 text-sm text-stone-700 leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl">
              <p>{product.description}</p>
              <div className="p-5 rounded-2xl bg-sand/30 border border-craft-200/80 mt-4 space-y-2">
                <h4 className="font-serif text-base font-semibold text-craft-900">
                  The Maker&apos;s Touch
                </h4>
                <p className="text-xs text-stone-600">
                  Every single piece is completely unique. Variations in wood grain, subtle flower placement in resin, and organic ceramic texture are cherished hallmarks of authentic artisan handcrafts.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="max-w-2xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cream border border-craft-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Materials Used
                  </span>
                  <span className="text-xs font-medium text-craft-900">
                    {product.materials || 'Natural organic crafting mediums'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-cream border border-craft-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Dimensions
                  </span>
                  <span className="text-xs font-medium text-craft-900">
                    {product.dimensions || 'Approx 15cm x 15cm'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-cream border border-craft-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Weight
                  </span>
                  <span className="text-xs font-medium text-craft-900">
                    {product.weight || 'Approx 450g'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-cream border border-craft-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Packaging
                  </span>
                  <span className="text-xs font-medium text-craft-900">
                    Signature Craft Gift Box with Eco-Wrap
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="max-w-2xl space-y-4">
              <p>{product.careInstructions || 'Wipe gently with a dry, clean microfibre cloth.'}</p>
              <ul className="list-disc pl-5 text-xs text-stone-600 space-y-1.5">
                <li>Keep away from extreme moisture or direct submerged water exposure.</li>
                <li>Avoid prolonged direct noon sunlight to maintain vibrant pigment luster.</li>
                <li>Never use alcohol, bleach, or abrasive scrubbing sponges.</li>
              </ul>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="max-w-2xl space-y-3 text-xs">
              <p>{product.deliveryInfo || 'Dispatches within 24-48 hours via premium express couriers.'}</p>
              <div className="space-y-2 pt-2">
                <p><strong>Standard Transit:</strong> 3–5 business days across India.</p>
                <p><strong>Insured Delivery:</strong> Every item is packaged with shock-absorbing honeycomb layers and corner guards.</p>
                <p><strong>Returns & Replacements:</strong> Free replacement in the rare event of transit damage upon photo verification within 48 hours.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Reviews List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6">
                    Be the first patron to review this handcrafted piece.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-cream border border-craft-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-craft-950">
                            {rev.customerName}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex text-gold">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 italic">
                        &quot;{rev.review}&quot;
                      </p>
                      <span className="text-[10px] text-stone-400 block">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Review Form (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-sand/30 border border-craft-200">
                <h4 className="font-serif text-lg font-semibold text-craft-950 mb-3">
                  Write an Artisan Review
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="e.g. Shalini Roy"
                      className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 text-gold"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newReviewRating ? 'fill-gold' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-craft-800 uppercase tracking-wider mb-1">
                      Your Words
                    </label>
                    <textarea
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your experience with the craftsmanship and texture..."
                      className="w-full px-3 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2.5 px-4 bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-cream rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="max-w-2xl space-y-4">
              <div className="p-4 rounded-xl bg-cream border border-craft-200">
                <h5 className="font-semibold text-xs text-craft-950 mb-1">
                  How long does customization take?
                </h5>
                <p className="text-xs text-stone-600">
                  Customized pieces are individually chiseled or preserved, usually requiring 2–4 studio working days before dispatch.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-cream border border-craft-200">
                <h5 className="font-semibold text-xs text-craft-950 mb-1">
                  Is gift packaging included?
                </h5>
                <p className="text-xs text-stone-600">
                  Yes, every Crafty Glora order is packed in our signature craft box tied with organic twine or silk ribbon.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-cream border border-craft-200">
                <h5 className="font-semibold text-xs text-craft-950 mb-1">
                  Can I request specific flower colors in resin?
                </h5>
                <p className="text-xs text-stone-600">
                  Yes! Use the Customization note or reach out directly on WhatsApp to coordinate botanical selections.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-craft-200">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
              You May Also Adore
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-craft-950">
              Complementary Creations
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
