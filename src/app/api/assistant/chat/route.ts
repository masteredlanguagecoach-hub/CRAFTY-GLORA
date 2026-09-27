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
    const { message, image, history = [], context = {}, currentCartItems = [] } = body;

    if ((!message || typeof message !== 'string') && !image) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    const effectiveMessage = message || (image ? 'I uploaded this reference photo for gift inspiration' : '');

    // 1. Fetch catalog products
    const allProducts = await productRepo.getAll();

    // 2. Extract semantic intents
    const updatedContext = extractUserIntent(effectiveMessage, context);

    // 3. Score products (with image weighting if image present)
    const matchedProducts = matchProducts(allProducts, updatedContext, effectiveMessage, Boolean(image));

    if (matchedProducts.length > 0) {
      updatedContext.lastShownProductIds = matchedProducts.map((p) => p.id);
    }

    // 4. Generate AI response
    const assistantResponse: ChatResponsePayload = await generateGeminiAssistantReply(
      effectiveMessage,
      history,
      updatedContext,
      matchedProducts,
      allProducts,
      Boolean(image)
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
