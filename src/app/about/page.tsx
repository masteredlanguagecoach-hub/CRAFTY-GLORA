import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, ShieldCheck, ArrowRight, Award, Compass } from 'lucide-react';

export const metadata = {
  title: 'Our Artisan Story & Craft Philosophy | Crafty Glora',
  description:
    'Discover the heartfelt story behind Crafty Glora — where master artisans mold natural elements, wild florals, and wood into bespoke treasures.',
};

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Hero Brand Story */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand/80 border border-craft-300 text-craft-800 text-xs font-semibold uppercase tracking-[0.2em]">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>The Maker&apos;s Atelier</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-craft-950 leading-tight">
          Crafted With Hands. <br />
          <span className="italic font-normal text-craft-700">Created With Heart.</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
          Crafty Glora was founded on a singular conviction: in an increasingly automated world, the soulful warmth of human hands and thoughtful personal craft matters more than ever.
        </p>
      </div>

      {/* Visual Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card border border-craft-200">
          <Image
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
            alt="Ceramic wheel sculpting"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card border border-craft-200 md:-translate-y-6">
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
            alt="Resin floral preservation"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card border border-craft-200">
          <Image
            src="https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?q=80&w=1000&auto=format&fit=crop"
            alt="Macrame wall knotting"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Core Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center text-gold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-craft-950">
            Uncompromising Craftsmanship
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            Every resin botanical, carved plaque, and terracotta vessel undergoes multi-step hand sanding, finishing, and rigorous inspection before leaving the studio.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center text-gold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-craft-950">
            Artisanal Personalization
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            We celebrate milestone occasions with customized calligraphy, custom inscriptions, and bespoke color palettes tailored to your unique story.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center text-gold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-craft-950">
            Natural Organic Mediums
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            From salvaged seasoned oak and freshwater driftwood to real wild blossoms and mineral pigments, natural materials are at the heart of our craft.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-10 sm:p-14 rounded-3xl bg-craft-900 text-cream text-center space-y-6 shadow-floating">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
          Bring the warmth of authentic craftsmanship into your home.
        </h2>
        <p className="text-sm text-craft-200 max-w-xl mx-auto font-normal">
          Explore our handmade resin botanical art, personalized name plaques, and handcrafted décor.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold hover:bg-gold-light text-craft-950 text-xs uppercase tracking-widest font-bold shadow-soft transition-all"
        >
          <span>Shop the Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
