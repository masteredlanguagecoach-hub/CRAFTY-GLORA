import { Product } from '@/types';
import {
  AssistantContext,
  AssistantProductRecommendation,
  ChatResponsePayload,
  AssistantOption,
} from '@/types/assistant';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';

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
        score -= 30;
      }
    }

    // 2. Specific intent / styles in query or context
    const wantsCheaper = query.includes('cheap') || query.includes('affordable') || query.includes('lower price') || context.style === 'cheap';
    const wantsPremium = query.includes('premium') || query.includes('luxury') || query.includes('expensive') || query.includes('high end') || context.style === 'premium';
    const wantsRomantic = query.includes('romantic') || query.includes('love') || query.includes('girlfriend') || query.includes('wife') || context.style === 'romantic' || context.occasion === 'anniversary' || context.occasion === 'valentine';
    const wantsCute = query.includes('cute') || query.includes('sweet') || context.style === 'cute';
    const wantsFloral = query.includes('flower') || query.includes('floral') || query.includes('botanical') || query.includes('plant') || context.style === 'floral';
    const wantsPersonalized = query.includes('personal') || query.includes('name') || query.includes('custom') || query.includes('inscri') || context.style === 'personalized' || context.wantsPersonalized === true;
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

    if (hasImage && (meta.isFloral || meta.isCeramic || meta.isWood || product.isCustomizable)) {
      score += 20;
    }

    return {
      ...product,
      score,
      matchReason: matchReasons[0] || 'Handmade artisan bestseller',
      isBestMatch: false,
    };
  });

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
  const text = userText.toLowerCase().trim();
  const context = { ...existingContext };

  // Yes / No answers
  if (text === 'yes' || text.startsWith('yes ') || text === 'yup' || text === 'sure' || text === 'yeah') {
    if (context.step === 'clarifying') {
      context.wantsPersonalized = true;
    }
  } else if (text === 'no' || text.startsWith('no ') || text === 'nope' || text === 'nah') {
    if (context.step === 'clarifying') {
      context.wantsPersonalized = false;
    }
  }

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
    { key: 'myself', patterns: ['myself', 'for me', 'my room', 'my home', 'self'] },
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
    { key: 'just because', patterns: ['just because', 'casual', 'surprise', 'no reason', 'exploring'] },
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
  if (text.includes('personal') || text.includes('name') || text.includes('custom')) {
    context.style = 'personalized';
    context.wantsPersonalized = true;
  }

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
 * Intelligent, Human-like decision making with structured MCQ/Yes-No questions when needed
 */
export async function generateGeminiAssistantReply(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[],
  hasImage = false
): Promise<ChatResponsePayload> {
  const text = userMessage.toLowerCase().trim();
  const isGreetingOnly = ['hi', 'hello', 'hey', 'namaste', 'hola', 'good morning', 'good evening', 'start'].includes(text);

  // If Gemini API Key is available, use LLM
  if (GEMINI_API_KEY) {
    try {
      const catalogSummary = allProducts
        .map(
          (p) =>
            `- ID: ${p.id}, Name: "${p.name}", Price: ₹${p.salePrice ?? p.price}, Category: ${p.category}, Customizable: ${p.isCustomizable}`
        )
        .join('\n');

      const systemInstruction = `You are Glora, a thoughtful, human-like master artisan & shopping concierge at CRAFTY GLORA handmade crafts.
Rules:
1. If the user only says "hi" or "hello", DO NOT dump products! Greet them warmly and ask who they are shopping for or what vibe they are imagining.
2. Only recommend products when you have enough context (or if they upload an image / ask for specific items).
3. Think and ask short clarifying questions (like multiple choice or yes/no) to discover what they truly need.
4. Keep answers warm, concise (2-3 sentences), and conversational.`;

      const promptContext = `Customer message: "${userMessage}"
Has uploaded image: ${hasImage ? 'Yes' : 'No'}
Current context: Recipient=${context.recipient || 'None'}, Occasion=${context.occasion || 'None'}, Budget=${context.budget || 'None'}
Catalog summary:
${catalogSummary}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history.slice(-4).map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
            { role: 'user', parts: [{ text: `${systemInstruction}\n\n${promptContext}` }] },
          ],
          generationConfig: { maxOutputTokens: 200, temperature: 0.75 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (geminiReply) {
          // Determine if we should show products
          const shouldShowProducts = !isGreetingOnly && (Boolean(context.recipient) || Boolean(context.budget) || Boolean(context.style) || hasImage || text.includes('show') || text.includes('gift') || text.includes('product'));
          return formatOutput(geminiReply, context, shouldShowProducts ? recommendedProducts : [], allProducts, hasImage);
        }
      }
    } catch (err) {
      console.warn('Gemini LLM notice, using intelligent dialogue engine:', err);
    }
  }

  // --- Dynamic Cognitive Conversational Engine ---
  
  // Case 1: Simple Greeting ("Hi", "Hello") -> DO NOT SHOW PRODUCTS, ASK FIRST QUESTION
  if (isGreetingOnly) {
    context.step = 'greeting';
    return {
      reply: "Namaste! ✨ Wonderful to have you here at Crafty Glora. I'm Glora, your studio concierge.\n\nWho are you shopping for today, or are you looking for something special for your own space?",
      questionType: 'single_choice',
      options: [
        { label: '👩 Girlfriend / Wife', value: 'Gift for Girlfriend', icon: '❤️' },
        { label: '💐 Mother / Parents', value: 'Gift for Mother', icon: '🌸' },
        { label: '👯 Best Friend / Sister', value: 'Gift for Friend', icon: '✨' },
        { label: '👨 Boyfriend / Husband', value: 'Gift for Husband', icon: '🎁' },
        { label: '🏠 For My Own Room', value: 'Home Decor for Myself', icon: '🏡' },
        { label: '🔍 Just Exploring Ideas', value: 'Just Exploring Ideas', icon: '💡' },
      ],
      quickReplies: ['🎁 Gift for Girlfriend', '💐 Gift for Mother', '🏠 For My Room', '✨ Surprise Me'],
      updatedContext: context,
    };
  }

  // Case 2: User uploaded an image
  if (hasImage) {
    context.step = 'recommending';
    return {
      reply: "What a stunning visual aesthetic! 🎨 I analyzed the colors, textures, and handmade charm in your photo. Here are the handcrafted pieces in our studio that capture that exact vibe:",
      products: recommendedProducts.length > 0 ? recommendedProducts : allProducts.slice(0, 3),
      questionType: 'single_choice',
      options: [
        { label: '✍️ Add Custom Name / Date', value: 'I want to customize with a name', icon: '✍️' },
        { label: '🎁 Gift Wrap & Box', value: 'Add luxury gift box', icon: '🎀' },
        { label: '💰 Filter under ₹1,000', value: 'Show cheaper options under 1000', icon: '🪙' },
      ],
      quickReplies: ['✍️ Personalize with Name', '💰 Under ₹1,000', '⚖️ Compare Top 2', '💬 WhatsApp Artisan'],
      updatedContext: context,
    };
  }

  // Case 3: User selected or mentioned a specific item
  if (context.selectedProductId) {
    const selected = allProducts.find((p) => p.id === context.selectedProductId);
    if (selected) {
      if (selected.isCustomizable) {
        return {
          reply: `An exquisite choice! **${selected.name}** is hand-crafted in our studio.\n\nWould you like our artisans to personalize this with custom engraved names, initials, or a memorable date? ✍️`,
          products: [selected],
          questionType: 'yes_no',
          options: [
            { label: '✅ Yes, add personal name/date', value: 'Yes, I want to personalize it', icon: '✍️' },
            { label: '❌ No, standard edition is fine', value: 'No, standard edition', icon: '✨' },
          ],
          quickReplies: ['Yes, add name', 'No, keep it standard', '🎁 Add Gift Box'],
          updatedContext: context,
        };
      } else {
        return {
          reply: `Wonderful pick! **${selected.name}** is in stock and ready to ship.\n\nWould you like us to nestle this inside our signature luxury gift box with dried botanical accents? 🎁`,
          products: [selected],
          questionType: 'yes_no',
          options: [
            { label: '🎁 Yes, add luxury gift box (+₹149)', value: 'Yes, add gift box', icon: '🎀' },
            { label: '📦 Standard eco packaging', value: 'Standard packaging', icon: '🌿' },
          ],
          quickReplies: ['🎁 Add Gift Box', '🛍️ Add to Cart', '⚖️ Show Alternatives'],
          updatedContext: context,
        };
      }
    }
  }

  // Case 4: We know Recipient, but NOT Budget or Style -> Clarify Budget with MCQ
  if (context.recipient && !context.budget && !context.style) {
    context.step = 'clarifying';
    return {
      reply: `Got it! A gift for your **${context.recipient}** is so thoughtful. 💝\n\nTo help me curate the best match, what budget range are you comfortable with?`,
      questionType: 'single_choice',
      options: [
        { label: '🪙 Budget-friendly (Under ₹1,000)', value: 'Under ₹1,000', icon: '🪙' },
        { label: '✨ Classic Gift (₹1,000 — ₹1,800)', value: '₹1,000 to ₹1,800', icon: '✨' },
        { label: '💎 Luxury Keepsake (₹1,800 — ₹3,500)', value: 'Above ₹1,800', icon: '💎' },
        { label: '👑 No Strict Budget', value: 'No strict budget, show best', icon: '👑' },
      ],
      quickReplies: ['Under ₹1,000', '₹1,000 — ₹1,800', 'Above ₹1,800', '🌸 Romantic Floral Only'],
      updatedContext: context,
    };
  }

  // Case 5: We know Recipient and Budget, but NOT Occasion or Personalization preference
  if (context.recipient && context.budget && context.wantsPersonalized === undefined && !context.occasion) {
    context.step = 'clarifying';
    return {
      reply: `Perfect! Within ₹${context.budget.toLocaleString('en-IN')} for your ${context.recipient}, we have breathtaking options.\n\nWould you prefer a **personalized piece** (with custom engraved names/dates) or a **ready-to-gift art decor**?`,
      questionType: 'single_choice',
      options: [
        { label: '✍️ Personalized (Custom Name/Date)', value: 'I want personalized with name', icon: '✍️' },
        { label: '🌸 Botanical / Floral Resin Art', value: 'Botanical floral resin art', icon: '🌸' },
        { label: '🪵 Rustic Wood / Ceramic Decor', value: 'Wood or ceramic home decor', icon: '🪵' },
        { label: '🕯️ Aromatic Terrazzo Candle', value: 'Handmade scented candle', icon: '🕯️' },
      ],
      quickReplies: ['✍️ Personalized', '🌸 Botanical Resin', '🪵 Rustic Wood', '🕯️ Scented Candle'],
      updatedContext: context,
    };
  }

  // Case 6: We have sufficient context (Recipient + Budget / Style / Occasion) -> PRESENT CURATED PRODUCTS
  if (recommendedProducts.length > 0) {
    context.step = 'recommending';
    const recipientText = context.recipient ? `for your **${context.recipient}**` : '';
    const budgetText = context.budget ? `under **₹${context.budget.toLocaleString('en-IN')}**` : '';

    return {
      reply: `I carefully evaluated our studio catalog and selected these ${recommendedProducts.length} handcrafted treasures ${recipientText} ${budgetText}. ✨\n\nWhich of these styles appeals to you most?`,
      products: recommendedProducts,
      questionType: 'single_choice',
      options: [
        { label: '❤️ I love the 1st one', value: 'I like the first product', icon: '✨' },
        { label: '🌸 I love the 2nd one', value: 'I like the second product', icon: '💖' },
        { label: '⚖️ Compare them side-by-side', value: 'Compare these options', icon: '⚖️' },
        { label: '🔄 Show different styles', value: 'Show different styles', icon: '🔄' },
      ],
      quickReplies: [
        '❤️ Choose 1st one',
        '🌸 Choose 2nd one',
        '⚖️ Compare Side-by-Side',
        '💰 Show Cheaper',
        '✨ More Premium',
      ],
      updatedContext: context,
    };
  }

  // Fallback: Clarify what aesthetic they like
  return {
    reply: "I'd love to help you find the perfect handcrafted piece! ✨ What craft style catches your eye?",
    questionType: 'single_choice',
    options: [
      { label: '🌸 Preserved Botanical Resin', value: 'Floral resin art', icon: '🌸' },
      { label: '🪵 Bespoke Wooden Plaques', value: 'Custom wood plaque', icon: '🪵' },
      { label: '🏺 Hand-thrown Ceramics & Vases', value: 'Ceramic pottery', icon: '🏺' },
      { label: '🕯️ Terrazzo Scented Candles', value: 'Terrazzo candle', icon: '🕯️' },
    ],
    quickReplies: ['🌸 Floral Resin', '🪵 Wood Plaque', '🏺 Ceramic Vase', '🕯️ Candle'],
    updatedContext: context,
  };
}

function formatOutput(
  reply: string,
  context: AssistantContext,
  recommendedProducts: AssistantProductRecommendation[],
  allProducts: Product[],
  hasImage = false
): ChatResponsePayload {
  return {
    reply,
    products: recommendedProducts.length > 0 ? recommendedProducts : undefined,
    quickReplies: recommendedProducts.length > 0
      ? ['❤️ Choose 1st one', '⚖️ Compare Options', '💰 Cheaper', '✍️ Personalize', '💬 WhatsApp Artisan']
      : ['🎁 Gift for Girlfriend', '💐 Gift for Mother', '🪙 Under ₹1,000', '🌸 Preserved Botanicals'],
    updatedContext: context,
  };
}
