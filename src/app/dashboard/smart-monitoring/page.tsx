'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';

export default function SmartMonitoringRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the full Phase 3 Smart Monitoring Dashboard
    router.replace('/dashboard/monitoring');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/60 shadow-xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
          <Activity className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-lime-500" />
            <span>Redirecting to Smart Monitoring Hub</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Opening IoT Telemetry System
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Navigating to the complete Virtual IoT, Weather Intelligence & Smart Farm Monitoring dashboard...
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard/monitoring">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <span>Go to Monitoring Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
