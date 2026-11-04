'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Bot, User, Send, AlertTriangle, Sparkles, Check, HelpCircle } from 'lucide-react';

export function AiAssistantDemo() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const samplePrompts = [
    {
      label: 'Tomato Yellowing Leaves',
      prompt: t(
        'aiDemo.userPrompt',
        'My tomato leaves are turning yellow with brown spots around the edges. What should I do?'
      ),
    },
    {
      label: 'Paddy Blast Prevention',
      prompt: 'What are the recommended preventative sprays for Neck Blast in Basmati paddy before heading stage?',
    },
    {
      label: 'Cotton Bollworm IPM',
      prompt: 'How to install pheromone traps for pink bollworm monitoring in Bt cotton fields?',
    },
  ];

  const [activePromptIndex, setActivePromptIndex] = useState(0);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('aiDemo.badge', 'Interactive Assistant Demonstration')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('aiDemo.title', 'Conversational Agricultural Advisory')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'aiDemo.subtitle',
              'Experience how farmers can interact in natural language to diagnose symptoms, plan crop schedules, and receive verified agronomic recommendations.'
            )}
          </p>
        </div>

        {/* Demo Chat Window Container */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-200/90 dark:border-emerald-800 shadow-2xl overflow-hidden">
          {/* Chat Window Header */}
          <div className="px-6 py-4 bg-emerald-800 dark:bg-[#06241B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/90 flex items-center justify-center border border-emerald-400/40 shadow-inner">
                <Bot className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">AgroCloud Assistant</h3>
                  <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-200">
                  Multilingual Agronomy Intelligence • v1.4
                </p>
              </div>
            </div>

            {/* Quick Demo Language Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-200 font-medium">Demo Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-emerald-950/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-600/60 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Demonstration Notice Disclaimer Banner */}
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{t('aiDemo.disclaimer', 'Demonstration Preview: Illustrates conversational advisory format. Production diagnosis requires image uploads and multi-spectral validation.')}</strong>
            </span>
          </div>

          {/* Chat Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-emerald-50/20 dark:bg-[#071F18]/50 min-h-[360px]">
            {/* User message */}
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-xl bg-emerald-700 text-white p-4 rounded-2xl rounded-tr-sm shadow-md">
                <p className="text-xs font-semibold text-emerald-200 uppercase mb-1">Farmer Query</p>
                <p className="text-sm sm:text-base leading-relaxed">
                  {activePromptIndex === 0 ? t('aiDemo.userPrompt', samplePrompts[0].prompt) : samplePrompts[activePromptIndex].prompt}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            </div>

            {/* AI Assistant response */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="max-w-2xl bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl rounded-tl-sm shadow-md">
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('aiDemo.confidence', 'Agronomic Diagnostic Confidence: 91%')}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-emerald-400 font-mono">
                    ICAR Package of Practices
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-stone-800 dark:text-emerald-100 leading-relaxed whitespace-pre-line space-y-2">
                  {t('aiDemo.aiResponse', 'Based on the symptoms of yellowing leaves with necrotic margins on tomato plants, this is likely Early Blight (Alternaria solani) or nutrient deficiency (Nitrogen or Potassium). Immediate steps:\n1. Isolate and prune lower affected foliage to stop spore splash.\n2. Ensure drip lines do not splash soil onto stems.\n3. Apply Mancozeb 75% WP (2g/L) or Copper Oxychloride if fungal signs persist.\n4. Consult local Krishi Vigyan Kendra (KVK) for soil nitrate testing.')}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-emerald-400/80">
                  <span>{t('aiDemo.actionAdvice', 'Generated via AgroCloud Crop Diagnostics Protocol v1.4')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Verified advisory
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Prompt Presets */}
          <div className="px-6 py-3 bg-white dark:bg-[#0A2920] border-t border-emerald-100 dark:border-emerald-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-emerald-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Try sample questions:</span>
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setActivePromptIndex(idx)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  activePromptIndex === idx
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Simulated Input Bar */}
          <div className="p-4 bg-emerald-50/60 dark:bg-[#07241B] border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={activePromptIndex === 0 ? t('aiDemo.userPrompt', samplePrompts[0].prompt) : samplePrompts[activePromptIndex].prompt}
              className="flex-1 bg-white dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
            />
            <button
              type="button"
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              title="Interactive demonstration input"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

