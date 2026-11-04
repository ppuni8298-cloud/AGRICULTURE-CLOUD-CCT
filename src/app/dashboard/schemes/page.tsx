'use client';

import React from 'react';
import { UpcomingModulePlaceholder } from '@/components/dashboard/UpcomingModulePlaceholder';

export default function GovernmentSchemesPage() {
  return (
    <UpcomingModulePlaceholder
      title="Government Schemes & Subsidies Assistant"
      category="Public Welfare & Grant Discovery"
      phase="Phase 2"
      description="The Government Schemes Assistant algorithmically analyzes your registered landholding acreage, crop categories, and regional state to automatically match and explain qualifying central and state agricultural support programs."
      plannedCapabilities={[
        'Automated qualification check for PM-KISAN, PMKSY, and Sub-Mission on Agri Mechanization (SMAM)',
        'State-specific scheme integration: Karnataka Raitha Siri, Rythu Bandhu, PM Fasal Bima',
        'Step-by-step documentation checklist and required affidavits in your regional language',
        'Direct links to official state land and subsidy portals (Bhoomi, Mahadbt, MeeSeva)',
      ]}
    />
  );
}

