import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PlatformCapabilities } from '@/components/landing/PlatformCapabilities';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { MultilingualShowcase } from '@/components/landing/MultilingualShowcase';
import { AiAssistantDemo } from '@/components/landing/AiAssistantDemo';
import { MandiIntelligencePreview } from '@/components/landing/MandiIntelligencePreview';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FarmerUseCases } from '@/components/landing/FarmerUseCases';
import { AgriculturalTechShowcase } from '@/components/landing/AgriculturalTechShowcase';
import { FaqSection } from '@/components/landing/FaqSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5FAF5] dark:bg-[#051D16] text-[#16352A] dark:text-[#E6F4EA] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Platform Capabilities (5 Pillars) */}
        <PlatformCapabilities />

        {/* 16 Modular Features Showcase */}
        <FeaturesShowcase />

        {/* Multilingual 12 Indian Languages Showcase */}
        <MultilingualShowcase />

        {/* AI Assistant Interactive Demonstration */}
        <AiAssistantDemo />

        {/* All-India Mandi Intelligence Explorer */}
        <MandiIntelligencePreview />

        {/* How It Works (4 Steps) */}
        <HowItWorks />

        {/* Farmer Use Cases */}
        <FarmerUseCases />

        {/* Agricultural Technology Stack Showcase */}
        <AgriculturalTechShowcase />

        {/* FAQ Accordion */}
        <FaqSection />

        {/* Validated Contact Form */}
        <ContactSection />
      </main>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}

