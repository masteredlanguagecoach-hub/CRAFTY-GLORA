import { Product } from '@/types';
import {
  AssistantContext,
  AssistantProductRecommendation,
  ChatResponsePayload,
} from '@/types/assistant';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';

// Enhanced product metadata tags mapping
export function enrichProductMetadata(product: Product) {
  const name = product.name.toLowerCase();
  const desc = (product.description + ' ' + product.shortDescription + ' ' + (product.materials || '')).toLowerCase();
  const cat = product.category.toLowerCase();

  const isRomantic = name.includes('flower') || name.includes('rose') || desc.includes('romantic') || desc.includes('anniversary') || desc.includes('love') || product.isCustomizable;
  const isCute = name.includes('earring') || name.includes('flower') || name.includes('dream') || desc.includes('cute') || desc.includes('pastel') || desc.includes('charming');
  const isFloral = name.includes('flower') || desc.includes('flower') || desc.includes('floral') || desc.includes('botanical') || desc.includes('daisy') || desc.includes('fern') || desc.includes('resin');
  const isWood = name.includes('wood') || desc.includes('wood') || desc.includes('sheesham') || desc.includes('teak') || desc.includes('plaque');
  const isCeramic = name.includes('ceramic') || name.includes('pottery') || name.includes('vase') || desc.includes('clay');
  const isCandle = name.includes('candle') || desc.includes('candle') || desc.includes('terrazzo') || desc.includes('fragrance');
  const isJewellery = cat.includes('jewellery') || name.includes('earring') || name.includes('necklace') || name.includes('bracelet');
  const isElegant = name.includes('gilded') || name.includes('gold') || desc.includes('velvet') || desc.includes('sheesham') || desc.includes('brass') || product.price > 1500;
  const isGiftSet = name.includes('set') || name.includes('hamper') || name.includes('box') || desc.includes('bundle');

  const recipients: string[] = [];
  if (isRomantic || product.isCustomizable) recipients.push('girlfriend', 'wife', 'partner', 'fiancee', 'boyfriend', 'husband');
  if (cat.includes('home') || cat.includes('wall') || cat.includes('ceramic') || cat.includes('candle')) recipients.push('mother', 'parents', 'family', 'friend', 'colleague', 'housewarming');
  if (isJewellery || isCute) recipients.push('sister', 'best friend', 'girlfriend', 'daughter');

  return {
    isRomantic,
    isCute,
    isFloral,
    isWood,
    isCeramic,
    isCandle,
    isJewellery,
    isElegant,
    isGiftSet,
    recipients,
    effectivePrice: product.salePrice ?? product.price,
  };
}

/**
 * Filter & rank catalog products based on current assistant context and user query
 */
export function matchProducts(
  allProducts: Product[],
  context: AssistantContext,
  userQuery = '',
  hasImage = false
): AssistantProductRecommendation[] {
  const query = userQuery.toLowerCase();
  const budget = context.budget;
  const inStockProducts = allProducts.filter((p) => p.stockQuantity > 0 && p.status === 'Active');

  const scored = inStockProducts.map((product) => {
    let score = 0;
    const meta = enrichProductMetadata(product);
    const name = product.name.toLowerCase();
    const desc = (product.description + ' ' + product.shortDescription + ' ' + (product.materials || '')).toLowerCase();
    const category = product.category.toLowerCase();
    let matchReasons: string[] = [];

    // 1. Budget scoring
    if (budget) {
      if (meta.effectivePrice <= budget) {
        score += 35;
        matchReasons.push(`Fits within your ₹${budget.toLocaleString('en-IN')} budget`);
      } else if (meta.effectivePrice <= budget * 1.2) {
        score += 10;
      } else {
        score -= 25;
      }
    }

    // 2. Specific intent / styles in query or context
    const wantsCheaper = query.includes('cheap') || query.includes('affordable') || query.includes('lower price') || context.style === 'cheap';
    const wantsPremium = query.includes('premium') || query.includes('luxury') || query.includes('expensive') || query.includes('high end') || context.style === 'premium';
    const wantsRomantic = query.includes('romantic') || query.includes('love') || query.includes('girlfriend') || query.includes('wife') || context.style === 'romantic' || context.occasion === 'anniversary' || context.occasion === 'valentine';
    const wantsCute = query.includes('cute') || query.includes('sweet') || context.style === 'cute';
    const wantsFloral = query.includes('flower') || query.includes('floral') || query.includes('botanical') || query.includes('plant') || context.style === 'floral';
    const wantsPersonalized = query.includes('personal') || query.includes('name') || query.includes('custom') || query.includes('inscri') || context.style === 'personalized';
    const wantsWood = query.includes('wood') || query.includes('wooden') || query.includes('plaque') || context.style === 'wood';
    const wantsCeramic = query.includes('ceramic') || query.includes('pot') || query.includes('vase') || context.style === 'ceramic';
    const wantsCandle = query.includes('candle') || query.includes('holder') || query.includes('terrazzo') || context.style === 'candle';

    if (wantsCheaper) {
      score += Math.max(0, 30 - (meta.effectivePrice / 100));
    }
    if (wantsPremium) {
      if (meta.effectivePrice > 1400 || meta.isElegant) score += 30;
    }
    if (wantsRomantic && meta.isRomantic) {
      score += 30;
      matchReasons.push('Romantic handmade keepsake');
    }
    if (wantsCute && meta.isCute) {
      score += 25;
      matchReasons.push('Charming and aesthetic design');
    }
    if (wantsFloral && meta.isFloral) {
      score += 35;
      matchReasons.push('Real preserved botanicals in resin');
    }
    if (wantsWood && meta.isWood) {
      score += 35;
      matchReasons.push('Hand-carved premium timber');
    }
    if (wantsCeramic && meta.isCeramic) {
      score += 35;
      matchReasons.push('Artisanal handmade stoneware ceramic');
    }
    if (wantsCandle && meta.isCandle) {
      score += 35;
      matchReasons.push('Hand-poured aromatic ambient craft');
    }
    if (wantsPersonalized && product.isCustomizable) {
      score += 40;
      matchReasons.push('Can be personalized with custom names & dates');
    }

    // 3. Recipient match
    if (context.recipient) {
      const rec = context.recipient.toLowerCase();
      if (['girlfriend', 'wife', 'partner', 'fiancee'].some((k) => rec.includes(k))) {
        if (meta.isRomantic || meta.isJewellery || product.isCustomizable || meta.isFloral) {
          score += 30;
          matchReasons.push(`Most popular choice for ${context.recipient}s`);
        }
      } else if (['mother', 'mom', 'parents', 'family'].some((k) => rec.includes(k))) {
        if (meta.isCeramic || meta.isCandle || category.includes('home') || category.includes('decor')) {
          score += 30;
          matchReasons.push('Thoughtful home accent for mothers & family');
        }
      } else if (['friend', 'best friend', 'sister', 'colleague'].some((k) => rec.includes(k))) {
        if (meta.isCute || meta.isJewellery || meta.isCandle || meta.isFloral) {
          score += 25;
          matchReasons.push('Delightful handcrafted gift for friends');
        }
      }
    }

    // 4. Occasion match
    if (context.occasion) {
      const occ = context.occasion.toLowerCase();
      if (['anniversary', 'valentine'].some((k) => occ.includes(k))) {
        if (meta.isRomantic || product.isCustomizable) score += 30;
      } else if (['birthday'].some((k) => occ.includes(k))) {
        if (product.isCustomizable || meta.isCute || meta.isJewellery) score += 25;
      } else if (['housewarming', 'home'].some((k) => occ.includes(k))) {
        if (meta.isCeramic || meta.isCandle || category.includes('wall') || category.includes('decor')) score += 35;
      }
    }

    // 5. Keyword search match
    const words = query.split(/\s+/).filter((w) => w.length > 2);
    for (const w of words) {
      if (name.includes(w)) score += 20;
      if (category.includes(w)) score += 15;
      if (desc.includes(w)) score += 10;
    }

    // If customer uploaded an image and product is aesthetic/craft
    if (hasImage && (meta.isFloral || meta.isCeramic || meta.isWood || product.isCustomizable)) {
      score += 15;
    }

    return {
      ...product,
      score,
      matchReason: matchReasons[0] || 'Handmade artisan bestseller',
      isBestMatch: false,
    };
  });

  // Sort descending by score
  const sorted = scored.sort((a, b) => b.score - a.score);

  if (sorted.length > 0 && sorted[0].score > 15) {
    sorted[0].isBestMatch = true;
  }

  return sorted.slice(0, 4);
}

/**
 * Natural language intent extractor from conversation
 */
export function extractUserIntent(
  userText: string,
  existingContext: AssistantContext,
  lastShownProducts: Product[] = []
): AssistantContext {
  const text = userText.toLowerCase();
  const context = { ...existingContext };

  // 1. Budget extraction
  const budgetMatch = text.match(/(?:under|below|around|about|within|max|upto|budget(?:\s+is)?|rs\.?|inr|₹)?\s*(\d{1,2}(?:,\d{3})+|\d+)\s*(?:k|thousand|rupees|rs|inr|₹)?/i);
  if (budgetMatch && !text.includes('step') && !text.includes('second')) {
    let rawVal = budgetMatch[1].replace(/,/g, '');
    let num = parseInt(rawVal, 10);
    if (text.includes('2k') || text.includes('1k') || text.includes('3k')) {
      const kMatch = text.match(/(\d+)k/i);
      if (kMatch) num = parseInt(kMatch[1], 10) * 1000;
    }
    if (num >= 200 && num <= 50000) {
      context.budget = num;
    }
  }

  // 2. Recipient extraction
  const recipients = [
    { key: 'girlfriend', patterns: ['girlfriend', 'gf', 'lady love', 'partner'] },
    { key: 'wife', patterns: ['wife', 'spouse', 'better half'] },
    { key: 'mother', patterns: ['mother', 'mom', 'mum', 'mommy', 'mummy', 'amma'] },
    { key: 'father', patterns: ['father', 'dad', 'daddy', 'papa', 'appa'] },
    { key: 'sister', patterns: ['sister', 'sis'] },
    { key: 'brother', patterns: ['brother', 'bro'] },
    { key: 'friend', patterns: ['friend', 'bestie', 'buddy', 'pal', 'colleague'] },
    { key: 'husband', patterns: ['husband', 'hubby'] },
    { key: 'boyfriend', patterns: ['boyfriend', 'bf'] },
    { key: 'myself', patterns: ['myself', 'for me', 'my room', 'my home'] },
  ];
  for (const r of recipients) {
    if (r.patterns.some((p) => text.includes(p))) {
      context.recipient = r.key;
      break;
    }
  }

  // 3. Occasion extraction
  const occasions = [
    { key: 'birthday', patterns: ['birthday', 'bday', 'birth day'] },
    { key: 'anniversary', patterns: ['anniversary', 'wedding anniversary'] },
    { key: 'wedding', patterns: ['wedding', 'marriage', 'shaadi', 'reception'] },
    { key: 'housewarming', patterns: ['housewarming', 'house warming', 'new home', 'griha pravesh'] },
    { key: 'valentine', patterns: ["valentine's", 'valentine', 'valentines'] },
    { key: 'festive', patterns: ['diwali', 'christmas', 'new year', 'rakhi', 'festival', 'festive'] },
    { key: 'just because', patterns: ['just because', 'casual', 'surprise', 'no reason'] },
  ];
  for (const occ of occasions) {
    if (occ.patterns.some((p) => text.includes(p))) {
      context.occasion = occ.key;
      break;
    }
  }

  // 4. Style & Material extraction
  if (text.includes('romantic') || text.includes('love')) context.style = 'romantic';
  if (text.includes('cute') || text.includes('sweet') || text.includes('adorable')) context.style = 'cute';
  if (text.includes('floral') || text.includes('flower') || text.includes('botanical') || text.includes('resin')) context.style = 'floral';
  if (text.includes('wood') || text.includes('timber') || text.includes('wooden') || text.includes('plaque')) context.style = 'wood';
  if (text.includes('ceramic') || text.includes('pottery') || text.includes('vase') || text.includes('clay')) context.style = 'ceramic';
  if (text.includes('candle') || text.includes('holder') || text.includes('terrazzo')) context.style = 'candle';
  if (text.includes('elegant') || text.includes('classy') || text.includes('luxury') || text.includes('premium')) context.style = 'premium';
  if (text.includes('cheap') || text.includes('affordable') || text.includes('budget friendly')) context.style = 'cheap';
  if (text.includes('personal') || text.includes('name') || text.includes('custom')) context.style = 'personalized';

  // 5. Contextual Product References
  if (lastShownProducts.length > 0) {
    if (text.includes('first') || text.includes('1st') || text.includes('number 1') || text.includes('#1')) {
      context.selectedProductId = lastShownProducts[0]?.id;
    } else if (text.includes('second') || text.includes('2nd') || text.includes('number 2') || text.includes('#2')) {
      context.selectedProductId = lastShownProducts[1]?.id;
    } else if (text.includes('third') || text.includes('3rd') || text.includes('number 3') || text.includes('#3')) {
      context.selectedProductId = lastShownProducts[2]?.id;
    } else if (text.includes('fourth') || text.includes('4th') || text.includes('number 4') || text.includes('#4')) {
      context.selectedProductId = lastShownProducts[3]?.id;
    } else if (text.includes('the cheaper one') || text.includes('cheapest')) {
      const sortedByPrice = [...lastShownProducts].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      context.selectedProductId = sortedByPrice[0]?.id;
    }
  }

  return context;
}

/**
 * Generate human-like, warm, empathetic shopping advice with short clarifying questions
 */
export async function generateGeminiAssistantReply(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[],
  hasImage = false
): Promise<ChatResponsePayload> {
  const isRecipientKnown = Boolean(context.recipient);
  const isOccasionKnown = Boolean(context.occasion);
  const isBudgetKnown = Boolean(context.budget);

  // If Gemini API Key is present, call Gemini 1.5 Flash / Pro model
  if (GEMINI_API_KEY) {
    try {
      const catalogSummary = allProducts
        .map(
          (p) =>
            `- ID: ${p.id}, Name: "${p.name}", Price: ₹${p.salePrice ?? p.price}, Category: ${p.category}, Customizable: ${p.isCustomizable}, Materials: ${p.materials || 'Handcrafted'}`
        )
        .join('\n');

      const systemInstruction = `You are Glora, the warm, charming, and thoughtful master artisan & gift consultant at CRAFTY GLORA (a luxury handmade craft studio).
Your personality: Empathetic, creative, attentive, and deeply appreciative of handmade arts (preserved botanical resin, bespoke wooden plaques, terrazzo candles, ceramic pottery, macrame).
Rules:
1. Speak naturally like a human studio consultant, never sound robotic or like a form template.
2. Ask 1 gentle, short question at a time if you need to narrow down preferences (e.g. asking their budget or recipient's favorite vibe). If the customer already provided details or uploaded an image, recommend immediately with enthusiasm!
3. Keep responses concise (2 to 4 sentences).
4. If an image is uploaded by customer, praise the aesthetic reference, describe the style/color tones, and recommend matching handcrafted products from catalog.
5. Emphasize handmade warmth, customization possibilities, and signature gift packaging.`;

      const promptContext = `Customer message: "${userMessage}"
Has uploaded image: ${hasImage ? 'Yes (reference photo uploaded)' : 'No'}
Current Context: Recipient=${context.recipient || 'Unknown'}, Occasion=${context.occasion || 'Unknown'}, Budget=${context.budget || 'Unknown'}, Style=${context.style || 'Unknown'}
Available catalog items:
${catalogSummary}

Respond directly as Glora.`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history.slice(-4).map((h) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: `${systemInstruction}\n\n${promptContext}` }] },
          ],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.75,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (geminiReply) {
          return buildResponsePayload(geminiReply, context, recommendedProducts, allProducts, hasImage);
        }
      }
    } catch (err) {
      console.warn('Gemini API call notice, falling back to dynamic conversational engine:', err);
    }
  }

  // Dynamic Natural Human Dialogue Engine (High-IQ Heuristics)
  let reply = '';
  const text = userMessage.toLowerCase();

  // 1. If customer uploaded an image
  if (hasImage) {
    if (recommendedProducts.length > 0) {
      reply = `What a lovely inspiration! 🎨 I analyzed the colors and handmade aesthetic in your image and handpicked these handcrafted pieces from our studio that match that exact vibe:`;
    } else {
      reply = `Thank you for sharing this beautiful photo! ✨ It has such a warm, artistic aesthetic. What budget or recipient do you have in mind so I can tailor the exact craft for you?`;
    }
  }
  // 2. Direct comparisons
  else if (text.includes('compare') || text.includes('difference between') || text.includes('vs')) {
    reply = `Here is a side-by-side breakdown of the craftsmanship, materials, and pricing to help you decide easily:`;
  }
  // 3. Customer asking for guidance / decision
  else if (text.includes('which one') || text.includes('help me choose') || text.includes('better')) {
    if (recommendedProducts.length >= 2) {
      const first = recommendedProducts[0];
      const second = recommendedProducts[1];
      reply = `If you want something deeply personal and timeless, I wholeheartedly recommend **${first.name}** (${first.matchReason}). If you prefer a subtle decorative touch, **${second.name}** is equally stunning! ✨`;
    } else {
      reply = `Based on what you shared, our top recommendation is **${recommendedProducts[0]?.name || 'our Preserved Botanical Keepsake'}** — it's beloved by our patrons!`;
    }
  }
  // 4. If selected a specific item
  else if (context.selectedProductId) {
    const selected = allProducts.find((p) => p.id === context.selectedProductId);
    if (selected) {
      if (selected.isCustomizable) {
        reply = `Wonderful taste! **${selected.name}** is hand-sculpted in our studio. Would you like to personalize it with a custom name, initials, or a special date? ✍️`;
      } else {
        reply = `Fantastic choice! **${selected.name}** is in stock and comes nestled in our signature luxury gift box with dried botanical accents. 🎁`;
      }
    } else {
      reply = `Got it! I've selected that handcrafted piece for you.`;
    }
  }
  // 5. If we have recipient or style or budget and can show recommendations
  else if (recommendedProducts.length > 0 && (isRecipientKnown || isOccasionKnown || isBudgetKnown || context.style)) {
    const count = recommendedProducts.length;
    if (context.recipient && context.budget) {
      reply = `I found ${count} heartfelt handmade treasures for your **${context.recipient}** under ₹${context.budget.toLocaleString('en-IN')}:`;
    } else if (context.recipient && context.occasion) {
      reply = `Celebrating your **${context.recipient}'s ${context.occasion}**! 🎉 Here are ${count} keepsake gifts sculpted for this special moment:`;
    } else if (context.recipient) {
      reply = `Here are ${count} artisan gifts your **${context.recipient}** will cherish. Would you like me to filter within a specific budget? 💰`;
    } else if (context.budget) {
      reply = `Here are ${count} premium handcrafted pieces comfortably within your **₹${context.budget.toLocaleString('en-IN')}** budget:`;
    } else {
      reply = `Here are our most adored handcrafted creations that match your taste:`;
    }
  }
  // 6. Natural conversational clarifying questions
  else if (!isRecipientKnown && !isOccasionKnown) {
    reply = `I'd love to help you find something truly special! 🎁 Who are you shopping for today, or is this a treat for your own home?`;
  } else if (!isBudgetKnown) {
    reply = `That sounds wonderful for your ${context.recipient || 'special someone'}! Do you have a budget in mind (e.g. under ₹1,000 or premium)?`;
  } else {
    reply = `Here are our studio's signature handcrafted bestsellers:`;
  }

  return buildResponsePayload(reply, context, recommendedProducts, allProducts, hasImage);
}

function buildResponsePayload(
  reply: string,
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[],
  hasImage = false
): ChatResponsePayload {
  let quickReplies: string[] = [];

  if (recommendedProducts.length > 0) {
    quickReplies = [
      '❤️ More Romantic',
      '💰 Under ₹1,000',
      '✨ More Luxury',
      '🌸 Preserved Botanicals',
      '🪵 Wooden Plaques',
      '✍️ Add Custom Name',
      '⚖️ Compare Top 2',
      '🎁 Gift Wrap It',
      '💬 WhatsApp Artisan',
    ];
  } else if (!context.recipient) {
    quickReplies = [
      '👩 Girlfriend / Wife',
      '💐 Mother / Parents',
      '👯 Best Friend / Sister',
      '👨 Boyfriend / Husband',
      '🏠 For My Own Room',
      '✨ Just Exploring',
    ];
  } else if (!context.budget) {
    quickReplies = [
      '🪙 Under ₹1,000',
      '✨ ₹1,000 — ₹1,800',
      '💎 ₹1,800 — ₹3,000',
      '👑 No Budget Limit',
    ];
  } else {
    quickReplies = [
      '🌸 Botanical Resin',
      '🪵 Engraved Wood',
      '🏺 Handmade Ceramic',
      '🕯️ Terrazzo Candle',
      '✨ Show Bestsellers',
    ];
  }

  let comparisonData = undefined;
  if (recommendedProducts.length >= 2) {
    comparisonData = {
      products: recommendedProducts.slice(0, 3),
      attributes: [
        {
          label: 'Price',
          values: recommendedProducts.slice(0, 3).map((p) => `₹${p.salePrice ?? p.price}`),
        },
        {
          label: 'Customizable',
          values: recommendedProducts.slice(0, 3).map((p) => (p.isCustomizable ? 'Yes ✍️ (Name / Date)' : 'Standard Edition')),
        },
        {
          label: 'Craft Medium',
          values: recommendedProducts.slice(0, 3).map((p) => (p.materials ? p.materials.split(',')[0] : 'Artisan Crafted')),
        },
        {
          label: 'Gift Packaging',
          values: recommendedProducts.slice(0, 3).map(() => 'Signature Box Included 🎁'),
        },
      ],
    };
  }

  return {
    reply,
    products: recommendedProducts.length > 0 ? recommendedProducts : undefined,
    quickReplies,
    updatedContext: {
      ...context,
      lastShownProductIds: recommendedProducts.map((p) => p.id),
    },
    comparisonData,
  };
}
