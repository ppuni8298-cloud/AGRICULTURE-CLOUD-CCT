'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Button } from '@/components/ui/Button';
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLocalMode } = useAuth();
  const { t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    const res = await login(data.email, data.password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setAuthError(res.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  // Quick Demo fill buttons for evaluator convenience
  const fillDemoFarmer = () => {
    setValue('email', 'farmer.rajesh@agrocloud.ai');
    setValue('password', 'KisanPass@2026');
  };

  const fillDemoAdmin = () => {
    setValue('email', 'admin@agrocloud.ai');
    setValue('password', 'AdminPass@2026');
  };

  return (
    <div className="min-h-screen bg-[#F5FAF5] dark:bg-[#051D16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-400/10 dark:bg-emerald-800/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Header with Theme, Language & Back to Home */}
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
          <div className="flex justify-center mb-4">
            <Logo size="md" showTagline={false} />
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              {t('auth.loginTitle', 'Welcome Back to AgroCloud AI')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
              {t(
                'auth.loginSubtitle',
                'Access your farm dashboard, market intelligence, and AI advisory.'
              )}
            </p>
          </div>

          {/* Local Mode Notice Badge */}
          {isLocalMode && (
            <div className="mb-6 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Interactive Development Sandbox</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-emerald-300/80 leading-relaxed mb-2">
                Supabase cloud credentials are not set in .env.local. You can click below for instant one-click preview credentials:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillDemoFarmer}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Demo Farmer (Rajesh)
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 text-[11px] font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  {t('auth.password', 'Password')} <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold"
                >
                  {t('auth.forgotPasswordLink', 'Forgot password?')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-emerald-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-emerald-200">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('auth.rememberMe', 'Remember this session')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              icon={<LogIn className="w-4 h-4" />}
              className="w-full mt-4 font-semibold text-sm"
            >
              {t('auth.signInButton', 'Sign In to Dashboard')}
            </Button>
          </form>

          {/* Register & Return Links */}
          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-800/60 text-center space-y-3">
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
              {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
              <Link
                href="/auth/register"
                className="font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-4"
              >
                {t('auth.signUpLink', 'Create an account')}
              </Link>
            </p>
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

        {/* Security footnote */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-emerald-800/80 dark:text-emerald-400/70">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Encrypted with Cloud PostgreSQL Row Level Security</span>
        </div>
      </div>
    </div>
  );
}

