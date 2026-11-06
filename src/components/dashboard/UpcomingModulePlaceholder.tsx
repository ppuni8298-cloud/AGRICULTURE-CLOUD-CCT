'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Layers, ArrowLeft, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UpcomingModulePlaceholderProps {
  title: string;
  category: string;
  phase?: string;
  description: string;
  plannedCapabilities: string[];
}

export function UpcomingModulePlaceholder({
  title,
  category,
  description,
  plannedCapabilities,
}: UpcomingModulePlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Top Back Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Overview</span>
        </Link>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-100 dark:border-emerald-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              {category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
              {title}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold w-fit">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Enterprise Expansion</span>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 mb-2">
              Architecture & Objective
            </h3>
            <p className="text-sm sm:text-base text-stone-700 dark:text-emerald-100 leading-relaxed">
              {description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Planned Technical Specifications</span>
            </h3>
            <ul className="space-y-2.5">
              {plannedCapabilities.map((cap, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 dark:text-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-emerald-100 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-stone-500 dark:text-emerald-400/80">
              This module route is reserved. Core database foundations and UI schemas are prepared.
            </p>

            <div className="flex items-center gap-3">
              <Button href="/dashboard" size="sm" variant="secondary">
                Overview
              </Button>
              <Button
                href="/dashboard/ai-assistant"
                size="sm"
                variant="primary"
                icon={<Bot className="w-3.5 h-3.5" />}
              >
                Ask AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

