'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  CheckCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import type { UserRole } from '@/lib/supabase/types';

interface DashboardNavbarProps {
  onMenuToggle: () => void;
}

export function DashboardNavbar({ onMenuToggle }: DashboardNavbarProps) {
  const { user, profile, logout, isLocalMode, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'Monsoon Spray Advisory',
      desc: 'Rain expected in Kolar district within 48 hours. Postpone foliar insecticide sprays.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Mandi Price Alert: Tomato',
      desc: 'Kolar APMC modal price jumped to ₹2,150 / Quintal (+12%).',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Weekly Farm Health Report',
      desc: 'NDVI vegetative indices for Plot A & B are 94% optimal.',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#071F18]/90 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onMenuToggle}
            type="button"
            className="p-2 rounded-xl text-emerald-950 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div className="relative w-full hidden sm:block">
            <Search className="w-4 h-4 text-stone-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farms, crops, diseases, mandi prices..."
              className="w-full bg-emerald-50/50 dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-2xl border border-emerald-200/80 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector variant="compact" />
          <ThemeToggle />

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
              className="relative p-2 rounded-xl text-emerald-900 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#0A2920] shadow-2xl border border-emerald-100 dark:border-emerald-800 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60 mb-3">
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    Notifications
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    2 Unread
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {sampleNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition-colors ${
                        notif.unread
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-700'
                          : 'bg-white dark:bg-[#082018] border-stone-100 dark:border-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-emerald-400 font-mono">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-emerald-200/80 leading-relaxed">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              type="button"
              className="flex items-center gap-2.5 p-1.5 sm:px-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden relative bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{profile?.full_name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>

              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 leading-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 leading-none">
                  {profile?.role || 'Farmer'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-emerald-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-[#0A2920] shadow-2xl border border-emerald-100 dark:border-emerald-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-emerald-100 dark:border-emerald-800/60 mb-2">
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    {profile?.full_name || 'Farmer Account'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-300/80 truncate">
                    {profile?.email || user?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                      Role: {profile?.role || 'Farmer'}
                    </span>
                    {profile?.state && (
                      <span className="text-[10px] font-semibold text-stone-500 dark:text-emerald-400">
                        {profile.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Switcher in Local Dev Mode */}
                {isLocalMode && switchDemoRole && (
                  <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/60 mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5">
                      Switch Role (Local Sandbox)
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Farmer', 'Agricultural Consultant', 'Administrator'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => switchDemoRole(r)}
                          className={`text-[10px] py-1 px-1.5 rounded-lg font-semibold truncate transition-colors ${
                            profile?.role === r
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-[#082018] text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {r.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                  >
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Profile & Preferences</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

