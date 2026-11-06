export interface FaqItem {
  question: string;
  answer: string;
  category: 'General' | 'Languages' | 'Mandi & Weather' | 'Security & Tech';
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'General',
    question: 'What is AgroCloud AI?',
    answer: 'AgroCloud AI is an advanced cloud-native, multilingual agricultural technology SaaS platform designed specifically for Indian farmers, agronomic consultants, and cooperative societies. It bridges precision agronomy, crop health analysis, localized weather, and APMC mandi price benchmarks into a single unified cloud system.',
  },
  {
    category: 'General',
    question: 'Is AgroCloud AI free for smallholder farmers?',
    answer: 'Yes! Core features including multilingual interface, farm plot registration, disease symptom consultation, and APMC mandi price discovery are designed with open, free access tiers for Indian farmers. Advanced enterprise features (like automated satellite imagery and digital farm twin simulations) are tailored for FPOs and consultants.',
  },
  {
    category: 'Languages',
    question: 'Which languages are supported?',
    answer: 'AgroCloud AI provides native interface support for 12 major Indian languages: English, Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Telugu (తెలుగు), Tamil (தமிழ்), Malayalam (മലയാളം), Marathi (मराठी), Gujarati (ગુજરાતી), Bengali (বাংলা), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), and Assamese (অসমীয়া). Language switching is instant across all pages without losing your context.',
  },
  {
    category: 'Mandi & Weather',
    question: 'How are mandi prices sourced?',
    answer: 'AgroCloud AI provides verified APMC market benchmarks with minimum, maximum, and modal prices per quintal across key states and commodities, integrated with official Agmarknet and national e-NAM portals.',
  },
  {
    category: 'Security & Tech',
    question: 'How is farmer data secured?',
    answer: 'AgroCloud AI enforces enterprise-grade PostgreSQL Row Level Security (RLS) via Supabase. Every farm plot, crop history record, and inquiry is encrypted in transit and at rest. Individual farmers have exclusive access to their own agricultural records.',
  },
  {
    category: 'Security & Tech',
    question: 'Can AgroCloud AI be used on mobile devices in low-connectivity rural areas?',
    answer: 'Absolutely. The platform is engineered with a responsive mobile-first architecture, light asset footprints, touch-friendly navigation, and client-side caching for seamless operation over 2G/3G/4G connections.',
  },
];

