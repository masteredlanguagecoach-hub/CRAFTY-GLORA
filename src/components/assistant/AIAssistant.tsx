'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Scale,
  Check,
  MessageCircle,
  ImagePlus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  AssistantMessage,
  AssistantContext,
  AssistantProductRecommendation,
  ChatResponsePayload,
  AssistantOption,
} from '@/types/assistant';
import { ProductRecommendationCard } from './ProductRecommendationCard';
import { ComparisonModal } from './ComparisonModal';
import { APP_CONFIG } from '@/lib/config';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AssistantContext>({ step: 'greeting' });
  const [comparisonModalData, setComparisonModalData] = useState<{
    products: AssistantProductRecommendation[];
    attributes?: { label: string; values: string[] }[];
  } | null>(null);

  // Customization mini-modal state inside widget
  const [activeCustomizingProduct, setActiveCustomizingProduct] =
    useState<AssistantProductRecommendation | null>(null);
  const [customText, setCustomText] = useState('');

  // Initial welcome message with interactive MCQ choices
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Namaste! ✨ I'm Glora, your personal artisan concierge at Crafty Glora.\n\nWho are you shopping for today? Or feel free to upload a photo of anything that inspires you!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      questionType: 'single_choice',
      options: [
        { label: '👩 Girlfriend / Wife', value: 'Gift for Girlfriend', icon: '❤️' },
        { label: '💐 Mother / Parents', value: 'Gift for Mother', icon: '🌸' },
        { label: '👯 Best Friend / Sister', value: 'Gift for Friend', icon: '✨' },
        { label: '👨 Boyfriend / Husband', value: 'Gift for Husband', icon: '🎁' },
        { label: '🏠 For My Own Room', value: 'Home Decor for Myself', icon: '🏡' },
        { label: '🔍 Just Exploring Ideas', value: 'Just Exploring Ideas', icon: '💡' },
      ],
      quickReplies: [
        '👩 Gift for Girlfriend',
        '💐 Gift for Mother',
        '🏠 For My Own Room',
        '🎂 Birthday under ₹1,000',
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
          questionType: data.questionType,
          options: data.options,
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
          text: "I had a tiny connection hiccup with the studio! Who are you shopping for today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: ['👩 Gift for Girlfriend', '💐 Gift for Mother', '💬 WhatsApp Artisan'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    sendMessage(optionValue);
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
          text: `Added **${activeCustomizingProduct.name}** to your cart with personalized inscription "${customText}"! ✍️\n\nWould you like luxury gift wrapping with a handwritten note card?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionType: 'yes_no',
          options: [
            { label: '🎁 Yes, add luxury gift box (+₹149)', value: 'Add luxury gift box', icon: '🎀' },
            { label: '🛍️ Proceed to checkout', value: 'Proceed to checkout', icon: '🚀' },
          ],
          quickReplies: [
            '🎁 Add Luxury Gift Box',
            '🛍️ View Cart & Checkout',
          ],
        },
      ]);
    }
  };

  return (
    <>
      {/* High-Contrast Floating Trigger Button (Deep Emerald & Burnished Gold) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Glora AI Assistant"
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-craft-950 to-stone-900 text-white rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.4)] border-2 border-amber-400 hover:border-amber-300 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-craft-950 shadow-inner">
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
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[450px] sm:h-[660px] z-50 flex flex-col bg-[#FAF7F2] sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border-2 border-amber-500/40 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
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
                  Thoughtful gift advice & visual matching
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F5EE]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Bubble */}
                <div className="flex items-start gap-2 max-w-[90%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-300 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-900 to-craft-900 text-white rounded-tr-none'
                        : 'bg-white text-craft-900 border border-craft-200 rounded-tl-none'
                    }`}
                  >
                    {/* User Uploaded Image Preview */}
                    {msg.image && (
                      <div className="relative w-48 h-36 rounded-xl overflow-hidden mb-2 border border-craft-200 bg-craft-100 shadow-inner">
                        <Image
                          src={msg.image}
                          alt="Uploaded reference photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div
                      className="whitespace-pre-wrap font-sans text-[13.5px]"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                    <span
                      className={`text-[10px] block mt-1.5 ${
                        msg.sender === 'user'
                          ? 'text-amber-200 text-right'
                          : 'text-craft-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Structured Interactive MCQ / Yes-No Choice Cards */}
                {msg.options && msg.options.length > 0 && (
                  <div className="w-full mt-2.5 pl-9 pr-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt.value)}
                        className="group flex items-center justify-between p-2.5 bg-white hover:bg-amber-50/80 border border-craft-200 hover:border-amber-400 rounded-xl text-xs text-left shadow-2xs transition-all active:scale-98"
                      >
                        <span className="flex items-center gap-2 font-medium text-craft-800 group-hover:text-amber-950">
                          {opt.icon && <span className="text-sm">{opt.icon}</span>}
                          <span>{opt.label}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-craft-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Attached Product Cards Carousel (Only rendered when decision is reached) */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-3 overflow-x-auto pb-2 flex gap-3 snap-x no-scrollbar pl-2">
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

                {/* Comparison Button */}
                {msg.comparisonData && (
                  <button
                    onClick={() => setComparisonModalData(msg.comparisonData!)}
                    className="mt-2.5 ml-9 flex items-center gap-1.5 px-3 py-1.5 bg-craft-100 hover:bg-amber-50 border border-craft-300 rounded-xl text-xs font-semibold text-craft-800 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    <span>View Side-by-Side Comparison</span>
                  </button>
                )}

                {/* Quick Reply Chips */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-9 max-w-full">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(reply)}
                        className="px-2.5 py-1 bg-craft-50 hover:bg-amber-100/70 text-craft-700 hover:text-amber-950 border border-craft-200 hover:border-amber-300 rounded-full text-[11px] font-medium transition-all active:scale-95"
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
              <div className="flex items-center gap-2 text-craft-500 text-xs py-2 pl-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-700" />
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
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-amber-300 shadow-2xs">
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
                placeholder="Type your response or ask a question..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-craft-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-craft-900 placeholder-craft-400"
              />
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                aria-label="Send Message"
                className="p-2.5 bg-gradient-to-r from-emerald-950 to-craft-950 hover:from-black hover:to-black text-white rounded-2xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
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
