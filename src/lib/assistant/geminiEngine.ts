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
  const isFloral = name.includes('flower') || desc.includes('flower') || desc.includes('floral') || desc.includes('botanical') || desc.includes('daisy') || desc.includes('fern');
  const isElegant = name.includes('gilded') || name.includes('gold') || desc.includes('velvet') || desc.includes('sheesham') || desc.includes('brass') || product.price > 1500;
  const isGiftSet = name.includes('set') || name.includes('hamper') || name.includes('box') || desc.includes('bundle');

  const recipients: string[] = [];
  if (isRomantic || product.isCustomizable) recipients.push('girlfriend', 'wife', 'partner', 'fiancee', 'boyfriend', 'husband');
  if (cat.includes('home') || cat.includes('wall') || cat.includes('ceramic') || cat.includes('candle')) recipients.push('mother', 'parents', 'family', 'friend', 'colleague', 'housewarming');
  if (cat.includes('jewellery') || isCute) recipients.push('sister', 'best friend', 'girlfriend', 'daughter');

  return {
    isRomantic,
    isCute,
    isFloral,
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
  userQuery = ''
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
        score += 25;
        matchReasons.push(`Fits under your ₹${budget.toLocaleString('en-IN')} budget`);
      } else if (meta.effectivePrice <= budget * 1.25) {
        score += 5; // Slightly above budget
      } else {
        score -= 20; // Well above budget
      }
    }

    // 2. Specific intent / styles in query or context
    const wantsCheaper = query.includes('cheap') || query.includes('affordable') || query.includes('lower price') || context.style === 'cheap';
    const wantsPremium = query.includes('premium') || query.includes('luxury') || query.includes('expensive') || query.includes('high end') || context.style === 'premium';
    const wantsRomantic = query.includes('romantic') || query.includes('love') || query.includes('girlfriend') || query.includes('wife') || context.style === 'romantic' || context.occasion === 'anniversary' || context.occasion === 'valentine';
    const wantsCute = query.includes('cute') || query.includes('sweet') || context.style === 'cute';
    const wantsFloral = query.includes('flower') || query.includes('floral') || query.includes('botanical') || query.includes('plant') || context.style === 'floral';
    const wantsPersonalized = query.includes('personal') || query.includes('name') || query.includes('custom') || query.includes('inscri') || context.style === 'personalized';
    const wantsGiftSet = query.includes('set') || query.includes('hamper') || query.includes('box') || query.includes('bundle');

    if (wantsCheaper) {
      score += Math.max(0, 30 - (meta.effectivePrice / 100));
    }
    if (wantsPremium) {
      if (meta.effectivePrice > 1400 || meta.isElegant) score += 30;
    }
    if (wantsRomantic && meta.isRomantic) {
      score += 25;
      matchReasons.push('Wonderfully romantic handmade vibe');
    }
    if (wantsCute && meta.isCute) {
      score += 25;
      matchReasons.push('Charming and adorable aesthetic');
    }
    if (wantsFloral && meta.isFloral) {
      score += 30;
      matchReasons.push('Features authentic preserved botanicals');
    }
    if (wantsPersonalized && product.isCustomizable) {
      score += 35;
      matchReasons.push('Supports custom name/message inscription');
    }
    if (wantsGiftSet && meta.isGiftSet) {
      score += 25;
      matchReasons.push('Curated complete gift set');
    }

    // 3. Category / Direct keyword matching
    const keywords = ['resin', 'wood', 'macrame', 'candle', 'vase', 'coaster', 'pottery', 'clay', 'earring', 'wall art', 'frame', 'dream catcher'];
    for (const kw of keywords) {
      if (query.includes(kw) && (name.includes(kw) || desc.includes(kw) || category.includes(kw))) {
        score += 35;
        matchReasons.push(`Matches your interest in ${kw}`);
      }
    }

    // 4. Recipient matching
    if (context.recipient) {
      const rec = context.recipient.toLowerCase();
      if (meta.recipients.some((r) => rec.includes(r) || r.includes(rec))) {
        score += 15;
      }
    }

    // Default bonus for bestsellers / high rating
    if (product.isBestSeller) score += 8;
    if (product.rating >= 4.8) score += 5;

    let finalReason = matchReasons.length > 0 ? matchReasons[0] : 'Handcrafted by studio artisans with natural materials.';
    if (budget && meta.effectivePrice <= budget && !finalReason.includes('budget')) {
      finalReason += ` and fits your ₹${budget} budget.`;
    }

    return {
      ...product,
      matchReason: finalReason,
      _score: score,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b._score - a._score);

  // Return top 3-4 products
  return scored.slice(0, 4).map(({ _score, ...p }, index) => ({
    ...p,
    isBestMatch: index === 0,
  }));
}

/**
 * Natural language intent extractor from conversation
 */
export function extractUserIntent(
  userText: string,
  existingContext: AssistantContext,
  lastShownProducts: Product[] = []
): { updatedContext: AssistantContext; directAction?: string; actionPayload?: any } {
  const text = userText.toLowerCase();
  const context = { ...existingContext };
  let directAction: string | undefined;
  let actionPayload: any;

  // 1. Budget extraction (e.g., "around 1500", "under 1,000", "₹2000", "2k", "1500 budget")
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
  ];
  for (const occ of occasions) {
    if (occ.patterns.some((p) => text.includes(p))) {
      context.occasion = occ.key;
      break;
    }
  }

  // 4. Style & Interest extraction
  if (text.includes('romantic') || text.includes('love')) context.style = 'romantic';
  if (text.includes('cute') || text.includes('sweet') || text.includes('adorable')) context.style = 'cute';
  if (text.includes('floral') || text.includes('flower') || text.includes('botanical')) context.style = 'floral';
  if (text.includes('elegant') || text.includes('classy') || text.includes('luxury')) context.style = 'elegant';
  if (text.includes('cheap') || text.includes('affordable') || text.includes('budget friendly')) context.style = 'cheap';
  if (text.includes('premium') || text.includes('expensive')) context.style = 'premium';
  if (text.includes('personal') || text.includes('name') || text.includes('custom')) context.style = 'personalized';

  // 5. Contextual Product References ("add the second one", "I like the 1st one", "the cheaper one")
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

  // 6. Direct Cart / Checkout / Packaging / Message actions
  if (text.includes('add to cart') || text.includes('add it') || text.includes('add the second') || text.includes('buy this')) {
    directAction = 'ADD_TO_CART';
  } else if (text.includes('checkout') || text.includes('proceed to checkout') || text.includes('pay now')) {
    directAction = 'PROCEED_TO_CHECKOUT';
  } else if (text.includes('view cart') || text.includes('show cart') || text.includes('my cart')) {
    directAction = 'VIEW_CART';
  } else if (text.includes('gift box') || text.includes('gift wrap') || text.includes('packaging')) {
    directAction = 'SELECT_PACKAGING';
    context.giftPackaging = text.includes('box') ? 'box' : 'wrap';
  } else if (text.includes('compare') || text.includes('difference between')) {
    directAction = 'SHOW_COMPARISON';
  }

  return { updatedContext: context, directAction, actionPayload };
}

/**
 * Call Gemini Generative Language API if key configured, or return fallback response
 */
export async function generateGeminiAssistantReply(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[]
): Promise<ChatResponsePayload> {
  const hasProducts = recommendedProducts.length > 0;
  const isBudgetKnown = Boolean(context.budget);
  const isOccasionKnown = Boolean(context.occasion);
  const isRecipientKnown = Boolean(context.recipient);

  // If we can call Gemini API
  if (GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are "Glora", the friendly, elegant, and ultra-efficient AI Shopping & Gift Consultant at CRAFTY GLORA (a premium handmade craft & custom gifts atelier in India).
Your core rule: HELP THE CUSTOMER MAKE A GOOD PURCHASE DECISION QUICKLY WITH AS FEW QUESTIONS AS POSSIBLE.
Do NOT talk too much. Keep responses short (1-2 sentences max).
Use emojis tastefully (🌸, ❤️, ✨, 🎁).
Always ground prices in INR (₹).
Never ask for information already known in the context.
If products are provided in the recommendation list, briefly introduce them (e.g. "I found 3 lovely pieces for your girlfriend under ₹1,500. ❤️").`;

      const promptContext = `Current Context:
Recipient: ${context.recipient || 'Not specified'}
Occasion: ${context.occasion || 'Not specified'}
Budget: ${context.budget ? `₹${context.budget}` : 'Not specified'}
Style: ${context.style || 'Not specified'}
Selected Product ID: ${context.selectedProductId || 'None'}

Recommended Products:
${recommendedProducts.map((p, i) => `${i + 1}. ${p.name} - ₹${p.salePrice ?? p.price} (Why: ${p.matchReason})`).join('\n')}

User message: "${userMessage}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
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
              maxOutputTokens: 150,
              temperature: 0.7,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (geminiReply) {
          return buildResponsePayload(geminiReply, context, recommendedProducts, allProducts);
        }
      }
    } catch (err) {
      console.warn('Gemini API call notice, using high-speed local engine:', err);
    }
  }

  // High-Speed Local AI Rule-Based Engine
  let reply = '';
  const text = userMessage.toLowerCase();

  // 1. If user asks "Which one should I choose?" or "Help me decide"
  if (text.includes('which one') || text.includes('help me choose') || text.includes('help me decide')) {
    if (recommendedProducts.length >= 2) {
      const first = recommendedProducts[0];
      const second = recommendedProducts[1];
      reply = `If you want something ${context.recipient ? `especially meaningful for your ${context.recipient}` : 'personal'}, I recommend **${first.name}** (${first.matchReason}). If you prefer a slightly different style, **${second.name}** is also fantastic! ✨`;
    } else {
      reply = `Based on what you shared, these handcrafted creations are the absolute best match! ✨`;
    }
  }
  // 2. If user requests a romantic/birthday gift message
  else if (text.includes('message') || text.includes('note') || text.includes('write')) {
    reply = `Here are a few heartfelt messages you can include with your gift:`;
  }
  // 3. If user says "I like the second one" or chooses a product
  else if (context.selectedProductId) {
    const selected = allProducts.find((p) => p.id === context.selectedProductId);
    if (selected) {
      if (selected.isCustomizable) {
        reply = `Wonderful choice! **${selected.name}** is hand-finished by our artisans. Would you like to add custom names or initials? ✍️`;
      } else {
        reply = `Excellent choice! **${selected.name}** is in stock and ready to be wrapped in our signature gift box. 🎁`;
      }
    } else {
      reply = `Got it! I've selected that piece for you.`;
    }
  }
  // 4. If we have enough info to show products
  else if (hasProducts) {
    const count = recommendedProducts.length;
    if (context.recipient && context.budget) {
      reply = `I found ${count} thoughtful pieces for your ${context.recipient} under ₹${context.budget.toLocaleString('en-IN')}:`;
    } else if (context.recipient) {
      reply = `Here are ${count} artisan gifts your ${context.recipient} will adore:`;
    } else if (context.budget) {
      reply = `Here are ${count} top-rated handcrafted pieces within your ₹${context.budget} budget:`;
    } else {
      reply = `Here are ${count} popular pieces from our studio collection:`;
    }
  }
  // 5. If missing recipient
  else if (!isRecipientKnown && !isOccasionKnown) {
    reply = `I'd love to help you find the perfect piece! 🎁 Who is this gift for?`;
  }
  // 6. If missing budget
  else if (!isBudgetKnown) {
    reply = `Got it! What budget do you have in mind? 💰`;
  } else {
    reply = `Here are our most cherished handcrafted pieces:`;
  }

  return buildResponsePayload(reply, context, recommendedProducts, allProducts);
}

function buildResponsePayload(
  reply: string,
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[]
): ChatResponsePayload {
  // Generate smart dynamic quick-reply chips
  let quickReplies: string[] = [];

  if (recommendedProducts.length > 0) {
    quickReplies = [
      '❤️ More Romantic',
      '💰 Cheaper',
      '✨ More Premium',
      '🎀 Cuter',
      '🌸 More Floral',
      '✍️ Personalized',
      '🎁 Gift Set',
      '⚖️ Compare Options',
      '✨ Best Match',
      '🔄 Show Different',
    ];
  } else if (!context.recipient) {
    quickReplies = [
      'Girlfriend',
      'Wife',
      'Mother',
      'Best Friend',
      'Sister',
      'For Myself',
      '🤷 I\'m Not Sure',
    ];
  } else if (!context.occasion) {
    quickReplies = [
      'Birthday',
      'Anniversary',
      'Wedding',
      'Housewarming',
      'Valentine\'s',
      'Just Because',
      '🤷 I\'m Not Sure',
    ];
  } else if (!context.budget) {
    quickReplies = [
      'Under ₹1,000',
      '₹1,000 — ₹1,500',
      '₹1,500 — ₹2,500',
      'Above ₹2,500',
      '🤷 No Strict Budget',
    ];
  } else {
    quickReplies = [
      '🌸 Floral Resin',
      '🪵 Wood Keepsakes',
      '🏺 Pottery & Vases',
      '🕯️ Candle Holders',
      '✨ Surprise Me',
    ];
  }

  // Comparison payload if requested
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
          label: 'Personalizable',
          values: recommendedProducts.slice(0, 3).map((p) => (p.isCustomizable ? 'Yes ✍️' : 'No')),
        },
        {
          label: 'Material',
          values: recommendedProducts.slice(0, 3).map((p) => (p.materials ? p.materials.split(',')[0] : 'Natural medium')),
        },
        {
          label: 'Gift Ready',
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
