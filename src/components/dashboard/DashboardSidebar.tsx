'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  LayoutDashboard,
  MapPin,
  Wheat,
  Bot,
  ScanEye,
  Activity,
  CloudSun,
  TrendingUp,
  Cpu,
  FileBarChart,
  ShoppingBag,
  Landmark,
  Wallet,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigationItems = [
    {
      title: t('dashboard.overview', 'Overview'),
      href: '/dashboard',
      icon: LayoutDashboard,
      status: 'Active',
    },
    {
      title: t('dashboard.myFarms', 'Farms & Land'),
      href: '/dashboard/farms',
      icon: MapPin,
      status: 'Active',
    },
    {
      title: t('dashboard.fieldsAndCrops', 'Fields & Crops'),
      href: '/dashboard/crops',
      icon: Wheat,
      status: 'Active',
    },
    {
      title: t('dashboard.aiAssistant', 'AI Assistant'),
      href: '/dashboard/ai-assistant',
      icon: Bot,
      status: 'Active',
    },
    {
      title: t('dashboard.cropDoctor', 'Crop Doctor'),
      href: '/dashboard/crop-doctor',
      icon: ScanEye,
      status: 'Active',
    },
    {
      title: t('dashboard.smartMonitoring', 'Smart Monitoring'),
      href: '/dashboard/smart-monitoring',
      icon: Activity,
      status: 'Active',
    },
    {
      title: t('dashboard.weather', 'Weather Intelligence'),
      href: '/dashboard/weather',
      icon: CloudSun,
      status: 'Active',
    },
    {
      title: t('dashboard.mandiIntelligence', 'Mandi Intelligence'),
      href: '/dashboard/mandi',
      icon: TrendingUp,
      status: 'Active',
    },
    {
      title: t('dashboard.digitalTwin', 'Digital Farm Twin'),
      href: '/dashboard/twin',
      icon: Cpu,
      status: 'Upcoming',
    },
    {
      title: t('dashboard.reports', 'Reports & Analytics'),
      href: '/dashboard/reports',
      icon: FileBarChart,
      status: 'Upcoming',
    },
    {
      title: t('dashboard.marketplace', 'Agri Marketplace'),
      href: '/dashboard/marketplace',
      icon: ShoppingBag,
      status: 'Upcoming',
    },
    {
      title: t('dashboard.governmentSchemes', 'Government Schemes'),
      href: '/dashboard/schemes',
      icon: Landmark,
      status: 'Upcoming',
    },
    {
      title: t('dashboard.finance', 'Farmer Finance'),
      href: '/dashboard/finance',
      icon: Wallet,
      status: 'Upcoming',
    },
    {
      title: t('dashboard.settings', 'Settings'),
      href: '/dashboard/settings',
      icon: Settings,
      status: 'Active',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#071F18] border-r border-emerald-100 dark:border-emerald-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800/60">
          <Logo size="md" showTagline />
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:text-emerald-400 dark:hover:text-emerald-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-400/70 mb-2">
            Farmer Ecosystem Navigation
          </p>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isUpcoming = item.status === 'Upcoming';

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                    : 'text-stone-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {isUpcoming && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-stone-100 dark:bg-emerald-950 text-stone-500 dark:text-emerald-400/60'
                    }`}
                  >
                    Phase 2+
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 m-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
              Phase 1 Platform Foundation
            </span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-emerald-300/80 leading-relaxed">
            All 14 modules structured with route guards, RLS, and 12-language localization.
          </p>
        </div>
      </aside>
    </>
  );
}

