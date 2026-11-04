import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'AgroCloud AI – Smart Farming. Intelligent Decisions. Better Tomorrow.',
  description:
    'AgroCloud AI is an advanced multilingual, cloud-native, AI-powered agricultural ecosystem designed for farmers across India. Monitor crops, explore mandi prices, and receive AI-backed farm advisory in 12 Indian languages.',
  keywords: [
    'AgroCloud AI',
    'Smart Farming India',
    'Indian Agriculture AI',
    'Mandi Prices APMC',
    'Crop Disease Detection',
    'Multilingual Agriculture',
    'Kisan Cloud Platform',
    'Precision Agriculture India',
  ],
  authors: [{ name: 'AgroCloud AI Engineering Team' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'AgroCloud AI – Smart Farming. Intelligent Decisions. Better Tomorrow.',
    description:
      'Empowering Indian farmers with multilingual AI agronomic intelligence, crop disease diagnostics, micro-weather advisories, and APMC mandi price benchmarks.',
    url: 'http://localhost:3000',
    siteName: 'AgroCloud AI',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'AgroCloud AI - Smart Agriculture Ecosystem for India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroCloud AI – Smart Farming Ecosystem',
    description: 'Multilingual cloud-native AI platform for Indian agriculture and mandi intelligence.',
    images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('agrocloud_theme');
                  if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

