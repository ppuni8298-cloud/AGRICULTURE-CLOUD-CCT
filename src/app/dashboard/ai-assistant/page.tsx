'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Bot, User, Send, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidence?: string;
}

export default function AiAssistantPage() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Namaste! I am your AgroCloud AI Agricultural Assistant. How can I assist you with your crops, soil, pest diagnostics, or mandi selling strategies today?',
      timestamp: '10:00 AM',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'My tomato leaves are turning yellow with brown concentric rings around the margins. What should I spray?',
      timestamp: '10:02 AM',
    },
    {
      id: 'm3',
      sender: 'assistant',
      text: 'Based on the concentric ring pattern (target board appearance) and yellow halo, this symptom corresponds strongly to Early Blight (Alternaria solani).\n\nImmediate Agronomic Recommendations:\n1. Cultural Control: Prune infected lower foliage immediately to prevent fungal spore splashing during irrigation.\n2. Chemical Control: Spray Mancozeb 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L of water.\n3. Micro-Weather Notice: Ensure spraying occurs during calm morning hours when leaf moisture is dry.\n4. KVK Consultation: If lesions appear on green fruits, contact the nearest Krishi Vigyan Kendra.',
      timestamp: '10:02 AM',
      confidence: 'Diagnostic Confidence: 92% (ICAR Protocol)',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `Thank you for your agronomy inquiry. Based on typical regional Indian soil and crop dynamics:\n\nEnsure appropriate soil drainage, verify whether drip lines have calcium scale buildup, and maintain recommended N-P-K nutrient schedules. In Phase 2, this assistant will directly analyze uploaded leaf photographs and sensor telemetry from your registered plots.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 'Diagnostic Confidence: 89% (Demonstration Protocol)',
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1000);
  };

  const setPrompt = (text: string) => {
    setInputQuery(text);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
              Multilingual AI Agriculture Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            Real-time conversational crop diagnostics, pesticide recommendations, and fertilizer scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-emerald-300 font-semibold">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advisory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Agronomic Advisory Notice:</strong> Recommendations are generated using ICAR packages of practices. Always confirm diagnosis with your local Krishi Vigyan Kendra before high-volume chemical application.
        </span>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-100 dark:border-emerald-800 shadow-xl overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-emerald-50/20 dark:bg-[#071F18]/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-sm shadow-md'
                    : 'bg-white dark:bg-[#0A2920] text-stone-800 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/80 rounded-tl-sm shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {m.sender === 'user' ? 'Farmer' : 'AgroCloud AI'}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">{m.timestamp}</span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{m.text}</p>

                {m.confidence && (
                  <div className="mt-3 pt-2 border-t border-emerald-100/60 dark:border-emerald-800/40 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3" />
                    <span>{m.confidence}</span>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-emerald-400 pl-11">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing agronomic database...</span>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="p-3 bg-emerald-50/50 dark:bg-[#082218] border-t border-emerald-100 dark:border-emerald-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
            Suggested Queries:
          </span>
          <button
            type="button"
            onClick={() => setPrompt('Recommended drip irrigation schedule for flowering tomato crops in hot climate?')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-200 hover:bg-emerald-50"
          >
            Irrigation Timing
          </button>
          <button
            type="button"
            onClick={() => setPrompt('How to manage Fall Armyworm in sweet corn without harmful chemicals?')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-200 hover:bg-emerald-50"
          >
            Fall Armyworm IPM
          </button>
          <button
            type="button"
            onClick={() => setPrompt('When is the best time to sell stored red onions in Lasalgaon mandi?')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-200 hover:bg-emerald-50"
          >
            Mandi Price Timing
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white dark:bg-[#0A2920] border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about pests, fertilizers, sowing windows or mandi prices..."
            className="flex-1 bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button type="submit" size="sm" variant="primary" icon={<Send className="w-3.5 h-3.5" />}>
            Ask AI
          </Button>
        </form>
      </div>
    </div>
  );
}

