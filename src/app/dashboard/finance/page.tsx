'use client';

import React from 'react';
import { UpcomingModulePlaceholder } from '@/components/dashboard/UpcomingModulePlaceholder';

export default function FinancePage() {
  return (
    <UpcomingModulePlaceholder
      title="Farmer Financial Management & Kisan Credit"
      category="Agri-Fintech & Cost of Cultivation"
      description="The Farmer Financial Management module provides a digital farm ledger for recording daily input expenses (seeds, diesel, fertilizer, labor wages), tracking Kisan Credit Card (KCC) interest cycles, and calculating true net seasonal profit margins per acre."
      plannedCapabilities={[
        'Automated Cost of Cultivation ledger (A2, A2+FL, and C2 metrics)',
        'Kisan Credit Card (KCC) annual repayment calendar and 3% prompt-repayment interest subvention alerts',
        'Pradhan Mantri Fasal Bima Yojana (PMFBY) premium vs risk payout estimator',
        'Direct bank statement reconciliation for agricultural loans',
      ]}
    />
  );
}

