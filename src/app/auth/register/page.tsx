'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  RegisterFormData,
  calculatePasswordStrength,
} from '@/lib/validations/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { INDIAN_STATES } from '@/i18n/languages';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Button } from '@/components/ui/Button';
import {
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type { UserRole } from '@/lib/supabase/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister, isLocalMode } = useAuth();
  const { supportedLanguages, t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      preferredLanguage: 'en',
      state: 'Karnataka',
      role: 'Farmer',
      acceptTerms: false,
    },
  });

  const passwordValue = watch('password') || '';
  const passwordStrength = calculatePasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    const res = await authRegister({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      preferredLanguage: data.preferredLanguage,
      state: data.state,
      role: data.role as UserRole,
    });

    if (res.success) {
      router.push('/dashboard');
    } else {
      setAuthError(res.error || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAF5] dark:bg-[#051D16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-400/10 dark:bg-emerald-800/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Header with Theme, Language & Back to Home */}
      <div className="max-w-xl w-full mx-auto px-4 sm:px-0 flex items-center justify-between mb-6">
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

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-[#0A2920] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-100 dark:border-emerald-800/80">
          <div className="flex justify-center mb-4">
            <Logo size="md" showTagline={false} />
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              {t('auth.registerTitle', 'Create Your AgroCloud AI Account')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
              {t(
                'auth.registerSubtitle',
                "Join India's premier intelligent cloud agricultural ecosystem."
              )}
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
              {authError.toLowerCase().includes('rate limit') && (
                <div className="mt-2 pl-6 text-xs text-stone-600 dark:text-red-300 space-y-1">
                  <p>
                    Supabase free tier limits confirmation emails to 3 per hour.
                  </p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Fix: In Supabase Dashboard &rarr; Auth &rarr; Providers &rarr; Email, disable <strong>"Confirm email"</strong>.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/auth/login"
                      className="inline-block text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Or click here to use 1-Click Demo Login &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                {t('auth.fullName', 'Full Name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder="e.g. Ramesh Kumar Patel"
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('auth.phone', 'Phone Number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="9876543210"
                  className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* State & Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('auth.state', 'State / Union Territory')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('state')}
                  className="w-full text-xs sm:text-sm font-medium bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {INDIAN_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('auth.preferredLanguage', 'Preferred Language')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('preferredLanguage')}
                  className="w-full text-xs sm:text-sm font-medium bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
                {errors.preferredLanguage && (
                  <p className="mt-1 text-xs text-red-500">{errors.preferredLanguage.message}</p>
                )}
              </div>
            </div>

            {/* User Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2">
                {t('auth.role', 'Account Role')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'Farmer', label: t('auth.roleFarmer', 'Farmer'), desc: 'Owns / operates plots' },
                  { value: 'Agricultural Consultant', label: t('auth.roleConsultant', 'Consultant'), desc: 'Advises growers' },
                  { value: 'Administrator', label: t('auth.roleAdmin', 'Administrator'), desc: 'Platform ops' },
                ].map((roleOption) => (
                  <label
                    key={roleOption.value}
                    className="flex flex-col p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/40 hover:bg-emerald-100/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {roleOption.label}
                      </span>
                      <input
                        type="radio"
                        value={roleOption.value}
                        {...register('role')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-emerald-400">
                      {roleOption.desc}
                    </span>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('auth.password', 'Password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('auth.confirmPassword', 'Confirm Password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Repeat password"
                    className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-emerald-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Strength Meter */}
            {passwordValue && (
              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-600 dark:text-emerald-300">
                    {t('auth.passwordStrength', 'Password Strength')}:
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-200">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-emerald-950 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terms and conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700 dark:text-emerald-200">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <span className="leading-relaxed">
                  {t(
                    'auth.acceptTerms',
                    'I agree to the Terms of Service and Privacy Policy for agricultural data storage.'
                  )}
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
              icon={<UserPlus className="w-4 h-4" />}
              className="w-full mt-4 font-semibold text-sm"
            >
              {t('auth.registerButton', 'Complete Registration')}
            </Button>
          </form>

          {/* Login & Return Links */}
          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-800/60 text-center space-y-3">
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
              {t('auth.alreadyHaveAccount', 'Already registered?')}{' '}
              <Link
                href="/auth/login"
                className="font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-4"
              >
                {t('auth.signInLink', 'Sign in here')}
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

        {/* Security badge */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-emerald-800/80 dark:text-emerald-400/70">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>PostgreSQL Row Level Security • Strict Data Privacy</span>
        </div>
      </div>
    </div>
  );
}

