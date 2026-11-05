'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  BarChart3,
  GitCompare,
  Truck,
  Lightbulb,
} from 'lucide-react';

interface MandiNavTabsProps {
  activeTab?: 'explorer' | 'comparison' | 'analytics' | 'transport' | 'advisor';
}

export function MandiNavTabs({ activeTab }: MandiNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: 'explorer',
      label: 'Live Mandi Prices',
      href: '/dashboard/mandi',
      icon: TrendingUp,
      isActive: pathname === '/dashboard/mandi' || activeTab === 'explorer',
    },
    {
      id: 'comparison',
      label: 'Market Comparison',
      href: '/dashboard/mandi/comparison',
      icon: GitCompare,
      isActive: pathname === '/dashboard/mandi/comparison' || activeTab === 'comparison',
    },
    {
      id: 'analytics',
      label: 'Historical Analytics',
      href: '/dashboard/mandi/analytics',
      icon: BarChart3,
      isActive: pathname === '/dashboard/mandi/analytics' || activeTab === 'analytics',
    },
    {
      id: 'transport',
      label: 'Transport & Net Profit',
      href: '/dashboard/mandi/transport-calculator',
      icon: Truck,
      isActive: pathname === '/dashboard/mandi/transport-calculator' || activeTab === 'transport',
    },
    {
      id: 'advisor',
      label: 'Selling Decision Advisor',
      href: '/dashboard/mandi/advisor',
      icon: Lightbulb,
      isActive: pathname === '/dashboard/mandi/advisor' || activeTab === 'advisor',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-emerald-100 dark:border-emerald-800/60 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
              tab.isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'bg-white dark:bg-[#0A2920] text-stone-700 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${tab.isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default MandiNavTabs;


