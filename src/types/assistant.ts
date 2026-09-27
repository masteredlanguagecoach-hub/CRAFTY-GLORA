import { CustomizationOption, Product } from '@/types';

export interface AssistantContext {
  recipient?: string;
  occasion?: string;
  budget?: number;
  style?: string;
  interests?: string[];
  color?: string;
  lastShownProductIds?: string[];
  selectedProductId?: string;
  customization?: CustomizationOption;
  giftPackaging?: 'box' | 'wrap' | 'none';
  giftMessage?: string;
  step?: 'initial' | 'asking_recipient' | 'asking_occasion' | 'asking_budget' | 'recommending' | 'customizing' | 'packaging' | 'messaging' | 'cart_ready';
}

export interface AssistantProductRecommendation extends Product {
  matchReason?: string;
  isBestMatch?: boolean;
}

export type AssistantActionType =
  | 'RECOMMEND_PRODUCTS'
  | 'ADD_TO_CART'
  | 'UPDATE_QUANTITY'
  | 'REMOVE_FROM_CART'
  | 'CUSTOMIZE_PRODUCT'
  | 'SELECT_PACKAGING'
  | 'ADD_GIFT_MESSAGE'
  | 'SHOW_COMPARISON'
  | 'VIEW_CART'
  | 'PROCEED_TO_CHECKOUT'
  | 'HUMAN_HANDOFF'
  | 'NONE';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  image?: string; // image preview url or base64
  products?: AssistantProductRecommendation[];
  quickReplies?: string[];
  action?: AssistantActionType;
  actionPayload?: any;
  comparisonData?: {
    products: AssistantProductRecommendation[];
    attributes: { label: string; values: string[] }[];
  };
  cartSummary?: {
    itemsCount: number;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
}

export interface ChatRequestPayload {
  message: string;
  image?: string; // base64 or url
  history: { role: 'user' | 'assistant'; content: string }[];
  context: AssistantContext;
  currentCartItems?: { productId: string; quantity: number }[];
}

export interface ChatResponsePayload {
  reply: string;
  products?: AssistantProductRecommendation[];
  quickReplies?: string[];
  action?: AssistantActionType;
  actionPayload?: any;
  updatedContext: AssistantContext;
  comparisonData?: {
    products: AssistantProductRecommendation[];
    attributes: { label: string; values: string[] }[];
  };
}
