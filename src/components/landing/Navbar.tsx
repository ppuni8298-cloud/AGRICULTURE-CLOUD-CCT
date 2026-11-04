'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.home', 'Home'), href: '#home' },
    { label: t('nav.features', 'Features'), href: '#features' },
    { label: t('nav.solutions', 'Capabilities'), href: '#capabilities' },
    { label: t('nav.mandi', 'Mandi Intelligence'), href: '#mandi' },
    { label: t('nav.languages', 'Languages'), href: '#languages' },
    { label: t('nav.about', 'About'), href: '#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#051D16]/90 backdrop-blur-md shadow-sm border-b border-emerald-100/80 dark:border-emerald-800/50 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" showTagline />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-emerald-950/80 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <ThemeToggle />

            {user ? (
              <Button href="/dashboard" size="sm" variant="primary" icon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                {t('nav.dashboard', 'Dashboard')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button href="/auth/login" size="sm" variant="ghost">
                  {t('nav.login', 'Login')}
                </Button>
                <Button href="/auth/register" size="sm" variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {t('nav.getStarted', 'Get Started')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 dark:bg-[#0A2920]/95 backdrop-blur-lg border-b border-emerald-100 dark:border-emerald-800 px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col space-y-3">
            <div className="py-2 border-b border-emerald-100/60 dark:border-emerald-800/40 flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Language</span>
              <LanguageSelector variant="full" />
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-emerald-950 dark:text-emerald-100 py-2 border-b border-emerald-50 dark:border-emerald-900/40 hover:text-emerald-600"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Button href="/dashboard" variant="primary" className="w-full">
                  {t('nav.dashboard', 'Go to Dashboard')}
                </Button>
              ) : (
                <>
                  <Button href="/auth/login" variant="secondary" className="w-full">
                    {t('nav.login', 'Login')}
                  </Button>
                  <Button href="/auth/register" variant="primary" className="w-full">
                    {t('nav.getStarted', 'Get Started Free')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

