'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Heart, Shield, Lock, ExternalLink } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/80">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" className="brightness-125" />
            <p className="text-xs sm:text-sm text-emerald-300/80 max-w-sm leading-relaxed">
              {t(
                'footer.tagline',
                'Smart Farming. Intelligent Decisions. Better Tomorrow.'
              )}
            </p>
            <p className="text-xs text-emerald-400/70">
              Cloud-native, multilingual agricultural technology ecosystem engineered for Indian smallholders, agricultural consultants, and cooperative federations.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-800 w-fit">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>PostgreSQL RLS & Cloud Security</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-200/80">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  {t('nav.home', 'Home')}
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  {t('nav.features', '16 Modular Features')}
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  {t('nav.solutions', 'Capabilities')}
                </a>
              </li>
              <li>
                <a href="#mandi" className="hover:text-white transition-colors">
                  {t('nav.mandi', 'Mandi Intelligence')}
                </a>
              </li>
              <li>
                <a href="#languages" className="hover:text-white transition-colors">
                  {t('nav.languages', '12 Regional Languages')}
                </a>
              </li>
            </ul>
          </div>

          {/* User Access */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-4">
              Access & Auth
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-200/80">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  {t('nav.login', 'Farmer Login')}
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  {t('nav.getStarted', 'Create Account')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t('nav.dashboard', 'Farmer Dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/auth/forgot-password" className="hover:text-white transition-colors">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Academic */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-4">
              Compliance & Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-200/80">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  {t('footer.privacy', 'Privacy Policy')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  {t('footer.terms', 'Terms of Service')}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  {t('footer.contact', 'Contact Technical Support')}
                </a>
              </li>
              <li>
                <span className="text-[11px] text-emerald-400/60 block mt-2">
                  Cloud Computing Capstone Project
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
          <p>© {new Date().getFullYear()} AgroCloud AI. {t('footer.rights', 'All rights reserved.')}</p>
          <p className="flex items-center gap-1.5">
            <span>{t('footer.designedFor', 'Engineered for Indian Agriculture')}</span>
            <span className="text-lime-400">🌾</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

