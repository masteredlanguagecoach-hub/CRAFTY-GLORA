'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  Gift,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  User,
  Scale,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  AssistantMessage,
  AssistantContext,
  AssistantProductRecommendation,
  ChatResponsePayload,
} from '@/types/assistant';
import { ProductRecommendationCard } from './ProductRecommendationCard';
import { ComparisonModal } from './ComparisonModal';
import { APP_CONFIG } from '@/lib/config';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AssistantContext>({ step: 'initial' });
  const [comparisonModalData, setComparisonModalData] = useState<{
    products: AssistantProductRecommendation[];
    attributes?: { label: string; values: string[] }[];
  } | null>(null);

  // Customization mini-modal state inside widget
  const [activeCustomizingProduct, setActiveCustomizingProduct] =
    useState<AssistantProductRecommendation | null>(null);
  const [customText, setCustomText] = useState('');

  // Initial welcome message
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Namaste! ✨ I'm Glora, your personal shopping & gift assistant. Tell me who you are shopping for or what aesthetic you love, and I'll find your perfect handcrafted match!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '🎁 Gift for Girlfriend',
        '🎂 Birthday Gift under ₹1000',
        '❤️ Romantic & Floral',
        '✍️ Personalized Name Plaque',
        '✨ Trending Bestsellers',
      ],
    },
  ]);

  const { addToCart, openCart, items, grandTotal } = useCart();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    setInputMessage('');

    // Add user message to state
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build conversation history format for API
      const history = newMessages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const cartItemsPayload = items.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
      }));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          context,
          currentCartItems: cartItemsPayload,
        }),
      });

      const data: ChatResponsePayload = await response.json();

      if (data && data.reply) {
        const assistantMsg: AssistantMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: data.products,
          quickReplies: data.quickReplies,
          action: data.action,
          actionPayload: data.actionPayload,
          comparisonData: data.comparisonData,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (data.updatedContext) {
          setContext(data.updatedContext);
        }

        // Handle direct AI action triggers
        if (data.action === 'ADD_TO_CART' && data.products && data.products.length > 0) {
          const productToAdd = data.products[0];
          addToCart(productToAdd, 1, data.updatedContext?.customization);
          showToast(`Added ${productToAdd.name} to cart!`, 'success');
        } else if (data.action === 'VIEW_CART') {
          openCart();
        } else if (data.action === 'SHOW_COMPARISON' && data.comparisonData) {
          setComparisonModalData(data.comparisonData);
        }
      } else {
        throw new Error('No reply received');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I had a tiny hiccup connecting to the studio. Here are our most beloved handcrafted treasures!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: ['🌸 Show Floral Resin Art', '✨ View All Gifts', '💬 WhatsApp Artisan'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply.includes('WhatsApp')) {
      window.open(
        `https://wa.me/${APP_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Crafty%20Glora,%20I'm%20looking%20for%20a%20handcrafted%20gift!`,
        '_blank'
      );
      return;
    }
    sendMessage(reply);
  };

  const handleAddToCart = (product: AssistantProductRecommendation) => {
    if (product.isCustomizable) {
      setActiveCustomizingProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleCustomizationSubmit = () => {
    if (activeCustomizingProduct) {
      const customOption = {
        customText: customText.trim() || undefined,
        giftPackaging: context.giftPackaging !== 'none',
        giftWrapNote: context.giftMessage,
      };

      addToCart(activeCustomizingProduct, 1, customOption);
      setActiveCustomizingProduct(null);
      setCustomText('');

      // Send acknowledgment in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          sender: 'assistant',
          text: `Added **${activeCustomizingProduct.name}** to your cart with customization "${customText}"! Would you like luxury gift wrapping or a personalized handwritten note card?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: [
            '🎁 Add Luxury Gift Box (+₹149)',
            '💌 Add Free Gift Note',
            '🛍️ View Cart & Checkout',
          ],
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Shopping Assistant"
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-gold-600 via-amber-600 to-gold-700 text-white rounded-full shadow-2xl hover:shadow-gold-500/30 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Glora AI
              </p>
              <p className="text-sm font-serif font-semibold">Shopping Assistant</p>
            </div>
          </button>
        )}
      </div>

      {/* Slide-out / Pop-up Glassmorphic Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] z-50 flex flex-col bg-[#FAF7F2] sm:rounded-3xl shadow-2xl border border-craft-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-craft-900 via-craft-800 to-craft-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 p-0.5 shadow-inner">
                <div className="w-full h-full rounded-full bg-craft-900 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-craft-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-1.5 text-gold-100">
                  Glora AI
                  <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30">
                    Artisan Concierge
                  </span>
                </h3>
                <p className="text-[11px] text-craft-300">
                  Instant gift advice & customized assistance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openCart()}
                aria-label="View Cart"
                className="p-2 text-craft-300 hover:text-white rounded-full hover:bg-craft-800 transition-colors relative"
              >
                <ShoppingBag className="w-4 h-4" />
                {items.length > 0 && (
                  <span className="absolute 1 top-1 right-1 w-4 h-4 bg-gold-500 text-craft-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Assistant"
                className="p-2 text-craft-300 hover:text-white rounded-full hover:bg-craft-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-craft-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Bubble */}
                <div className="flex items-start gap-2 max-w-[88%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 mt-1 border border-gold-200">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-gold-600 to-amber-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-craft-900 border border-craft-200/80 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div
                      className="whitespace-pre-wrap font-sans"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                    <span
                      className={`text-[10px] block mt-1 ${
                        msg.sender === 'user'
                          ? 'text-amber-100 text-right'
                          : 'text-craft-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Attached Product Cards Carousel */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-3 overflow-x-auto pb-2 flex gap-3 snap-x no-scrollbar">
                    {msg.products.map((product) => (
                      <div key={product.id} className="snap-start">
                        <ProductRecommendationCard
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Comparison Data Button */}
                {msg.comparisonData && (
                  <button
                    onClick={() => setComparisonModalData(msg.comparisonData!)}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-craft-100 hover:bg-gold-50 border border-craft-300 rounded-xl text-xs font-semibold text-craft-800 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-gold-600" />
                    <span>View Side-by-Side Comparison</span>
                  </button>
                )}

                {/* Quick Reply Chips */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-full">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-white hover:bg-gold-50 text-craft-800 hover:text-gold-800 border border-craft-200 hover:border-gold-300 rounded-full text-xs font-medium shadow-2xs transition-all active:scale-95"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-craft-500 text-xs py-2">
                <div className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center border border-gold-200">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-craft-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                  <span className="text-xs text-craft-500 ml-1">
                    Glora is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Customization Mini-Modal */}
          {activeCustomizingProduct && (
            <div className="p-4 bg-amber-50/90 border-t border-amber-200/80 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Personalize: {activeCustomizingProduct.name}
                </h4>
                <button
                  onClick={() => setActiveCustomizingProduct(null)}
                  className="text-craft-400 hover:text-craft-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="E.g. Custom name, special date, initials..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white mb-2"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveCustomizingProduct(null)}
                  className="px-3 py-1.5 text-xs text-craft-600 hover:bg-amber-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomizationSubmit}
                  className="px-4 py-1.5 bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Add to Cart with Customization
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-craft-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask for gift ideas, budget or styles..."
                className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-2xl bg-craft-50 border border-craft-200 focus:outline-hidden focus:ring-2 focus:ring-gold-500 focus:bg-white transition-all text-craft-900 placeholder-craft-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send Message"
                className="p-2.5 bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-700 hover:to-amber-700 text-white rounded-2xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {comparisonModalData && (
        <ComparisonModal
          products={comparisonModalData.products}
          attributes={comparisonModalData.attributes}
          onClose={() => setComparisonModalData(null)}
          onSelectProduct={handleAddToCart}
        />
      )}
    </>
  );
};
