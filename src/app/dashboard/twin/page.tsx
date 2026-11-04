'use client';

import React from 'react';
import { UpcomingModulePlaceholder } from '@/components/dashboard/UpcomingModulePlaceholder';

export default function DigitalTwinPage() {
  return (
    <UpcomingModulePlaceholder
      title="Digital Farm Twin & Spatial Simulation"
      category="Simulation & 3D Geo-Spatial"
      phase="Phase 3"
      description="The Digital Farm Twin module provides a virtual hydrological and vegetative 3D replica of your cadastral parcels. It combines elevation topology, soil moisture sensors, and Sentinel-2 canopy vigor to simulate water accumulation, nutrient leaching, and heat stress before they physically impact crops."
      plannedCapabilities={[
        'Interactive GeoJSON plot polygon boundaries with spatial heatmaps',
        'FAO-56 hydrological flow simulation modeling surface run-off during heavy rainfall',
        'Canopy volume and leaf area index (LAI) progression tracking',
        'Scenario projection: simulate postponing irrigation by 3 to 7 days',
      ]}
    />
  );
}

