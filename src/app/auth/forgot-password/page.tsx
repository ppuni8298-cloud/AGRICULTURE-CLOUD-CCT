'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await resetPassword(data.email);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.error || 'Failed to send reset instructions');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5FAF5] dark:bg-[#051D16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <div className="max-w-md w-full mx-auto px-4 sm:px-0 flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100 bg-white/80 dark:bg-[#0A2920] px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm transition-all hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0A2920] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-100 dark:border-emerald-800/80">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              {t('auth.forgotTitle', 'Reset Your Password')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
              {t(
                'auth.forgotSubtitle',
                'Enter your registered email address to receive password reset instructions.'
              )}
            </p>
          </div>

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                {t('auth.email', 'Email Address')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="farmer@example.com"
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              icon={<Mail className="w-4 h-4" />}
              className="w-full mt-4 font-semibold text-sm"
            >
              {t('auth.sendResetLink', 'Send Reset Link')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-800/60 text-center space-y-3">
            <div>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('auth.backToLogin', 'Back to login')}</span>
              </Link>
            </div>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 dark:text-emerald-400/80 dark:hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Landing Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

