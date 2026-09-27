import { NextRequest, NextResponse } from 'next/server';
import { productRepo } from '@/lib/repositories/sheetRepositories';
import {
  extractUserIntent,
  matchProducts,
  generateGeminiAssistantReply,
} from '@/lib/assistant/geminiEngine';
import { ChatRequestPayload, ChatResponsePayload } from '@/types/assistant';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();
    const { message, history = [], context = {}, currentCartItems = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // 1. Fetch fresh catalog products from repository (Google Sheets / in-memory fallback)
    const allProducts = await productRepo.getAll();

    // 2. Extract semantic intents from the user's message & update context
    const extractedIntent = extractUserIntent(message, context);
    const updatedContext = { ...context, ...extractedIntent };

    // 3. Score and rank catalog products
    const matchedProducts = matchProducts(allProducts, updatedContext, message);

    // Track recently shown product IDs for contextual references ("the second one", "cheaper one", etc.)
    if (matchedProducts.length > 0) {
      updatedContext.lastShownProductIds = matchedProducts.map((p) => p.id);
    }

    // 4. Generate AI response (using Gemini API or heuristic intelligence engine)
    const assistantResponse: ChatResponsePayload = await generateGeminiAssistantReply(
      message,
      history,
      updatedContext,
      matchedProducts,
      allProducts
    );

    return NextResponse.json({
      success: true,
      ...assistantResponse,
    });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process AI assistant request',
      },
      { status: 500 }
    );
  }
}
