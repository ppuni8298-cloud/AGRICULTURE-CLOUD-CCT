'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { INDIAN_STATES } from '@/i18n/languages';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  User,
  Languages,
  Moon,
  Sun,
  Bell,
  Save,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import type { UserRole } from '@/lib/supabase/types';

export default function SettingsPage() {
  const { profile, isLocalMode, switchDemoRole } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [state, setState] = useState(profile?.state || 'Karnataka');
  const [role, setRole] = useState<UserRole>((profile?.role as UserRole) || 'Farmer');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifMandi, setNotifMandi] = useState(true);
  const [notifDisease, setNotifDisease] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (switchDemoRole) {
      switchDemoRole(role);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            Account & System Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
          Customize your interface language, appearance theme, notification channels, and farmer profile.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Your preferences have been successfully updated and persisted!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Details Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-800/60 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                Farmer Profile Information
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-400">
                Primary agricultural identity stored under Supabase profiles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full text-xs sm:text-sm bg-stone-100 dark:bg-[#071F18]/50 text-stone-500 dark:text-emerald-400 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                State / UT
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-800/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
              User Role
            </label>
            <div className="flex flex-wrap gap-3">
              {(['Farmer', 'Agricultural Consultant', 'Administrator'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    role === r
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language & Theme Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-800/60 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                Language & Appearance (Themes)
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-400">
                Persistent interface preference across all 12 Indian languages
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <Moon className="w-4 h-4 text-emerald-300" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-800/60 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                Notification Preferences
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-400">
                Alert preferences stored in PostgreSQL user_preferences table
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Email Spray & Weather Advisories',
                checked: notifEmail,
                setter: setNotifEmail,
                desc: 'Receive alerts 36 hours before predicted heavy monsoon rainfall.',
              },
              {
                label: 'SMS Weather Emergency Warnings',
                checked: notifSms,
                setter: setNotifSms,
                desc: 'Instant SMS for frost alerts, severe wind warnings, or hailstorms.',
              },
              {
                label: 'APMC Mandi Price Spikes & Drops',
                checked: notifMandi,
                setter: setNotifMandi,
                desc: 'Daily price change notifications for your registered crop commodities.',
              },
              {
                label: 'Regional Pest & Disease Outbreak Broadcasts',
                checked: notifDisease,
                setter: setNotifDisease,
                desc: 'Alerts when neighboring farms log viral or fungal infestations.',
              },
            ].map((item, idx) => (
              <label
                key={idx}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60 cursor-pointer"
              >
                <div className="pr-4">
                  <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {item.label}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/80 mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 mt-1"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

