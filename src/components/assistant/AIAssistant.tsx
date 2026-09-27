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
  ImagePlus,
  Paperclip,
  Trash2,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  // Initial welcome message with short interactive questions
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Namaste! ✨ I'm Glora, your personal studio concierge at Crafty Glora.\n\nAre you looking for a gift for someone special, or a handcrafted piece for your own home? You can also upload any photo/inspiration you love!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '👩 Gift for Girlfriend / Wife',
        '💐 Gift for Mother / Parents',
        '👯 Gift for Best Friend',
        '🏠 For My Own Room',
        '🎂 Birthday under ₹1,000',
        '🌸 Preserved Botanical Art',
      ],
    },
  ]);

  const { addToCart, openCart, items } = useCart();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading, selectedImage]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Handle Image Upload / Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    const currentImage = selectedImage;

    if ((!message && !currentImage) || isLoading) return;

    setInputMessage('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Add user message to state
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message || 'I uploaded this inspiration photo 📸',
      image: currentImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
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
          image: currentImage,
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
          text: "I had a tiny hiccup connecting to our master studio. Here are our most beloved handcrafted treasures!",
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

      setMessages((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          sender: 'assistant',
          text: `Added **${activeCustomizingProduct.name}** to your cart with personalized inscription "${customText}"! Would you like luxury gift wrapping or a personalized handwritten note card? 🎁`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: [
            '🎁 Add Luxury Gift Box (+₹149)',
            '💌 Add Free Handwritten Note',
            '🛍️ View Cart & Checkout',
          ],
        },
      ]);
    }
  };

  return (
    <>
      {/* High-Visibility Floating Trigger Button (Deep Royal Emerald & Amber Glow) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Glora AI Assistant"
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-craft-900 to-amber-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.35)] border-2 border-amber-400 hover:border-amber-300 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-craft-900 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-950 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-emerald-950"></span>
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                Glora AI
              </p>
              <p className="text-xs font-serif font-bold text-white tracking-wide">
                Gift & Shopping Concierge
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[650px] z-50 flex flex-col bg-[#FAF7F2] sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-craft-300 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-craft-900 to-stone-900 text-white p-4 flex items-center justify-between border-b border-amber-500/20 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-craft-950 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-craft-950 rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-1.5 text-amber-200">
                  Glora AI
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-sans font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                    Artisan Concierge
                  </span>
                </h3>
                <p className="text-[11px] text-craft-300">
                  Human-like craft guidance & image matching
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
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-craft-950 text-[10px] font-bold rounded-full flex items-center justify-center">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60">
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
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-200 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-900 to-craft-900 text-white rounded-tr-none'
                        : 'bg-white text-craft-900 border border-craft-200 rounded-tl-none'
                    }`}
                  >
                    {/* User Uploaded Image Preview in Chat */}
                    {msg.image && (
                      <div className="relative w-48 h-36 rounded-xl overflow-hidden mb-2 border border-craft-200 bg-craft-100">
                        <Image
                          src={msg.image}
                          alt="Uploaded reference photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

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
                          ? 'text-amber-200 text-right'
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
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-craft-100 hover:bg-amber-50 border border-craft-300 rounded-xl text-xs font-semibold text-craft-800 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
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
                        className="px-3 py-1.5 bg-white hover:bg-amber-50 text-craft-800 hover:text-amber-900 border border-craft-200 hover:border-amber-300 rounded-full text-xs font-medium shadow-2xs transition-all active:scale-95"
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
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-craft-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                  <span className="text-xs text-craft-600 font-medium ml-1">
                    Glora is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Customization Mini-Modal */}
          {activeCustomizingProduct && (
            <div className="p-4 bg-amber-50/95 border-t border-amber-200 animate-in fade-in">
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
                placeholder="E.g. Custom name (Rahul & Priya), special date, initials..."
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
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Add to Cart with Inscription
                </button>
              </div>
            </div>
          )}

          {/* Image Selected Staging Tray */}
          {selectedImage && (
            <div className="px-3 py-2 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-amber-300">
                  <Image
                    src={selectedImage}
                    alt="Selected upload"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs text-amber-900 font-medium">
                  Photo attached for inspiration
                </span>
              </div>
              <button
                onClick={removeSelectedImage}
                className="p-1 rounded-full text-amber-700 hover:bg-amber-200/60"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input & Image Upload Area */}
          <div className="p-3 bg-white border-t border-craft-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="assistant-image-input"
              />

              {/* Upload Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image / reference photo"
                className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors flex-shrink-0"
              >
                <ImagePlus className="w-4 h-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask for ideas, occasion, budget, or upload photo..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-craft-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-craft-900 placeholder-craft-400"
              />
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                aria-label="Send Message"
                className="p-2.5 bg-gradient-to-r from-emerald-900 to-craft-900 hover:from-emerald-950 hover:to-black text-white rounded-2xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4 text-amber-300" />
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
