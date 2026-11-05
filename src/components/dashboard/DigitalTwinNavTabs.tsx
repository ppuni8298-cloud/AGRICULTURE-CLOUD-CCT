'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Satellite,
  Camera,
  Sliders,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface DigitalTwinNavTabsProps {
  activeTab?: 'twin' | 'satellite' | 'drone' | 'simulator' | 'geospatial' | 'predictive';
}

export function DigitalTwinNavTabs({ activeTab }: DigitalTwinNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: 'twin',
      label: 'Digital Farm Twin',
      href: '/dashboard/digital-twin',
      icon: Layers,
      isActive: pathname === '/dashboard/digital-twin' || pathname === '/dashboard/twin' || activeTab === 'twin',
    },
    {
      id: 'satellite',
      label: 'Satellite Intelligence',
      href: '/dashboard/satellite',
      icon: Satellite,
      isActive: pathname === '/dashboard/satellite' || activeTab === 'satellite',
    },
    {
      id: 'drone',
      label: 'Drone Analytics',
      href: '/dashboard/drone-analytics',
      icon: Camera,
      isActive: pathname === '/dashboard/drone-analytics' || activeTab === 'drone',
    },
    {
      id: 'simulator',
      label: 'What-If Simulator',
      href: '/dashboard/farm-simulator',
      icon: Sliders,
      isActive: pathname === '/dashboard/farm-simulator' || activeTab === 'simulator',
    },
    {
      id: 'geospatial',
      label: 'Geospatial Boundaries',
      href: '/dashboard/geospatial',
      icon: MapPin,
      isActive: pathname === '/dashboard/geospatial' || activeTab === 'geospatial',
    },
    {
      id: 'predictive',
      label: 'Predictive Analytics',
      href: '/dashboard/predictive-analytics',
      icon: TrendingUp,
      isActive: pathname === '/dashboard/predictive-analytics' || activeTab === 'predictive',
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 mb-6 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-800">
      <div className="flex items-center gap-2 min-w-max p-1.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60">
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
    </div>
  );
}

export default DigitalTwinNavTabs;
