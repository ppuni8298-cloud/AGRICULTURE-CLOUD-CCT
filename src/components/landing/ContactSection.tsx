'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/validations/auth';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle, Send, AlertCircle, Phone, MapPin } from 'lucide-react';

export function ContactSection() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase.from('contact_inquiries') as any).insert([
            {
              name: data.name,
              email: data.email,
              subject: data.subject,
              message: data.message,
            },
          ]);
          if (error) throw error;
        }
        setSubmissionStatus('success');
        setStatusMessage(
          'Your inquiry has been successfully transmitted to the AgroCloud AI database. Our agronomy team will follow up via email.'
        );
        reset();
      } else {
        // Local mode fallback: save to localStorage inquiries
        const existing = localStorage.getItem('agrocloud_contact_inquiries');
        const list = existing ? JSON.parse(existing) : [];
        list.push({ ...data, id: Date.now(), timestamp: new Date().toISOString() });
        localStorage.setItem('agrocloud_contact_inquiries', JSON.stringify(list));

        setSubmissionStatus('success');
        setStatusMessage(
          'Local Development Mode: Inquiry saved locally in the browser store. (Connect live Supabase or SMTP provider for real email routing).'
        );
        reset();
      }
    } catch (err: unknown) {
      setSubmissionStatus('error');
      setStatusMessage(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column Info */}
          <div className="lg:col-span-5">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
              {t('contact.badge', 'Get in Touch')}
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
              {t('contact.title', 'Contact the AgroCloud AI Team')}
            </h2>
            <p className="mt-4 text-base text-[#64756B] dark:text-emerald-300/80 leading-relaxed">
              {t(
                'contact.subtitle',
                'Have questions about deployment, partnerships, or agronomic data? Our technical team is here to assist.'
              )}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 dark:text-emerald-400 uppercase">Email Support</p>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">contact@agrocloud.ai</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 dark:text-emerald-400 uppercase">Toll-Free Kisan Line (Demo)</p>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">1800-AGRO-CLOUD</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 dark:text-emerald-400 uppercase">Cloud Capstone Lab</p>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">Dept. of Computer Science & Engineering, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-200/90 dark:border-emerald-800 shadow-xl">
              <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 mb-6">
                Send an Inquiry
              </h3>

              {submissionStatus === 'success' && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{statusMessage}</p>
                </div>
              )}

              {submissionStatus === 'error' && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium">{statusMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      {t('contact.name', 'Your Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Anand Patil"
                      className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                      {t('contact.email', 'Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="anand@example.com"
                      className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                    {t('contact.subject', 'Subject')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    placeholder="e.g. FPO Cluster Deployment Inquiry"
                    className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                    {t('contact.message', 'Message / Query')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    {...register('message')}
                    placeholder="Please specify your query regarding agricultural data, mandi integration, or platform access..."
                    className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                  className="w-full sm:w-auto mt-2"
                >
                  {t('contact.submit', 'Send Message')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

