import { NextRequest, NextResponse } from 'next/server';
import type { RecommendedCropItem } from '@/lib/supabase/types';

interface CropProfile {
  name: string;
  scientific_name: string;
  varieties: string[];
  ideal_soils: string[];
  ideal_ph_range: [number, number];
  water_need_mm: string;
  duration_days: string;
  suitable_seasons: string[];
  yield_estimate: string;
  profit_potential: 'High' | 'Medium' | 'Moderate';
  suitable_conditions: string;
  common_risks: string[];
  base_score: number;
}

const CROP_DATABASE: CropProfile[] = [
  {
    name: 'Paddy (Rice)',
    scientific_name: 'Oryza sativa',
    varieties: ['RNR-15048 (Telangana Sona)', 'MTU-1010', 'BPT-5204 (Samba Mahsuri)', 'IR-64'],
    ideal_soils: ['Clay', 'Clay Loam', 'Alluvial', 'Black Cotton'],
    ideal_ph_range: [5.5, 7.2],
    water_need_mm: 'High (1100–1400 mm)',
    duration_days: '120–140 days',
    suitable_seasons: ['Kharif', 'Rabi'],
    yield_estimate: '22–28 Quintals/Acre',
    profit_potential: 'High',
    suitable_conditions: 'Heavy moisture retention, standing water availability, warm daytime temperatures (25–35°C).',
    common_risks: ['Rice blast fungal susceptibility in high humidity', 'Stem borer attacks during vegetative tillering', 'Water table depletion if tube-well dependent'],
    base_score: 82,
  },
  {
    name: 'Cotton (Bt/Hybrid)',
    scientific_name: 'Gossypium hirsutum',
    varieties: ['Bollgard II', 'RCH-659', 'Bunny Bt', 'DCH-32'],
    ideal_soils: ['Black Cotton', 'Deep Loamy', 'Clay'],
    ideal_ph_range: [6.5, 8.0],
    water_need_mm: 'Medium (600–800 mm)',
    duration_days: '150–180 days',
    suitable_seasons: ['Kharif'],
    yield_estimate: '8–14 Quintals/Acre (Seed Cotton)',
    profit_potential: 'High',
    suitable_conditions: 'Deep, moisture-retentive black soil with excellent sun exposure (>6 hours/day), frost-free cycle.',
    common_risks: ['Pink bollworm infestation during boll opening', 'Square dropping under excessive waterlogging', 'Market price volatility on APMC exchanges'],
    base_score: 80,
  },
  {
    name: 'Maize (Corn)',
    scientific_name: 'Zea mays',
    varieties: ['Pioneer P3396', 'NK-6240', 'DHM-117', 'CO-6'],
    ideal_soils: ['Red Sandy Loam', 'Alluvial', 'Loamy', 'Silt Loam'],
    ideal_ph_range: [6.0, 7.5],
    water_need_mm: 'Moderate (500–650 mm)',
    duration_days: '95–115 days',
    suitable_seasons: ['Kharif', 'Rabi', 'Zaid'],
    yield_estimate: '25–32 Quintals/Acre',
    profit_potential: 'High',
    suitable_conditions: 'Well-drained soil rich in organic matter; sensitive to water stagnation at germination stage.',
    common_risks: ['Fall Armyworm (Spodoptera frugiperda) whorl damage', 'Waterlogging during silking stage reduces cob size', 'Post-harvest aflatoxin development if stored wet'],
    base_score: 85,
  },
  {
    name: 'Groundnut (Peanut)',
    scientific_name: 'Arachis hypogaea',
    varieties: ['Kadiri-6', 'TMV-2', 'JL-24', 'G2-52'],
    ideal_soils: ['Red Sandy Loam', 'Light Loamy', 'Sandy'],
    ideal_ph_range: [6.0, 7.0],
    water_need_mm: 'Low to Moderate (400–550 mm)',
    duration_days: '105–125 days',
    suitable_seasons: ['Kharif', 'Rabi'],
    yield_estimate: '10–16 Quintals/Acre',
    profit_potential: 'Medium',
    suitable_conditions: 'Friable, porous topsoil enabling easy peg penetration and pod development; avoids heavy crusting.',
    common_risks: ['Tikka leaf spot under continuous rainfall', 'Collar rot in saturated soils', 'Wild boar damage during pod maturation'],
    base_score: 78,
  },
  {
    name: 'Soybean',
    scientific_name: 'Glycine max',
    varieties: ['JS-335', 'JS-9560', 'MACS-1407', 'NRC-37'],
    ideal_soils: ['Black Cotton', 'Loamy', 'Clay Loam'],
    ideal_ph_range: [6.2, 7.5],
    water_need_mm: 'Moderate (450–650 mm)',
    duration_days: '90–105 days',
    suitable_seasons: ['Kharif'],
    yield_estimate: '8–12 Quintals/Acre',
    profit_potential: 'High',
    suitable_conditions: 'Warm, humid tropical climate with uniform rainfall during flowering and pod development.',
    common_risks: ['Yellow Mosaic Virus transmitted by whiteflies', 'Pod shattering if harvesting is delayed past maturity', 'Dry spells during pod filling phase'],
    base_score: 81,
  },
  {
    name: 'Chilli (Hot Pepper)',
    scientific_name: 'Capsicum annuum',
    varieties: ['Guntur Sannam (S4)', 'Byadagi Kaddi', 'Teja', 'Indam 5'],
    ideal_soils: ['Black Cotton', 'Red Sandy Loam', 'Clay Loam'],
    ideal_ph_range: [6.5, 7.5],
    water_need_mm: 'Moderate (600–800 mm)',
    duration_days: '150–180 days',
    suitable_seasons: ['Kharif', 'Rabi'],
    yield_estimate: '15–22 Quintals/Acre (Dry)',
    profit_potential: 'High',
    suitable_conditions: 'Warm, semi-arid climate with drip fertigation and well-aerated ridge-and-furrow beds.',
    common_risks: ['Black thrips (Thrips parvispinus) leaf curl outbreaks', 'Die-back and fruit rot (Anthracnose) in wet spells', 'High pesticide cost requirements'],
    base_score: 79,
  },
  {
    name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    varieties: ['Abhinav (Syngenta)', 'Arka Rakshak', 'Saaho', 'US-440'],
    ideal_soils: ['Red Sandy Loam', 'Loamy', 'Well-Drained Black'],
    ideal_ph_range: [6.0, 7.2],
    water_need_mm: 'Moderate (600–750 mm)',
    duration_days: '110–130 days',
    suitable_seasons: ['Kharif', 'Rabi', 'Zaid'],
    yield_estimate: '180–250 Quintals/Acre (Fresh Fruit)',
    profit_potential: 'High',
    suitable_conditions: 'Sunny canopy, drip fertigation with staking/trellising, daytime 24–30°C and cool nights.',
    common_risks: ['Early and Late blight during cloudy/humid spells', 'Tomato Leaf Curl Virus (ToLCV)', 'Severe seasonal market glut and price drops'],
    base_score: 83,
  },
  {
    name: 'Finger Millet (Ragi)',
    scientific_name: 'Eleusine coracana',
    varieties: ['GPU-28', 'ML-365', 'KMR-301', 'Indaf-8'],
    ideal_soils: ['Red Sandy Loam', 'Laterite', 'Gravelly Loam', 'Poor Soils'],
    ideal_ph_range: [5.0, 7.5],
    water_need_mm: 'Low (300–450 mm)',
    duration_days: '100–120 days',
    suitable_seasons: ['Kharif', 'Rabi'],
    yield_estimate: '12–18 Quintals/Acre',
    profit_potential: 'Moderate',
    suitable_conditions: 'Extremely hardy drought-tolerant millet; thrives in acidic, shallow, marginal red rainfed soils.',
    common_risks: ['Blast disease during high nitrogen usage', 'Lodging in excessive rains at dough stage', 'Lower market liquidity compared to cash crops'],
    base_score: 84,
  },
  {
    name: 'Chickpea (Bengal Gram)',
    scientific_name: 'Cicer arietinum',
    varieties: ['JG-11', 'JAKI-9218', 'Vijay', 'Annigeri-1'],
    ideal_soils: ['Black Cotton', 'Clay Loam', 'Silt Loam'],
    ideal_ph_range: [6.5, 8.2],
    water_need_mm: 'Low (250–400 mm)',
    duration_days: '90–110 days',
    suitable_seasons: ['Rabi'],
    yield_estimate: '6–10 Quintals/Acre',
    profit_potential: 'Medium',
    suitable_conditions: 'Residual soil moisture post-Kharif; cool, dry winter climate with minimal cloudiness.',
    common_risks: ['Fusarium wilt in poorly rotated soils', 'Pod borer (Helicoverpa armigera) during pod development', 'Excess rain/fog at flowering causes flower drop'],
    base_score: 82,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      soilType = 'Red Sandy Loam',
      soilPh = 6.8,
      soilMoisture = 50,
      season = 'Kharif',
      rainfallForecast = 45,
      temperature = 28,
    } = body;

    const evaluatedCrops: RecommendedCropItem[] = CROP_DATABASE.map((crop) => {
      let score = crop.base_score;
      const reasons: string[] = [];

      // 1. Soil Match
      const soilMatch = crop.ideal_soils.some((s) => s.toLowerCase().includes(soilType.toLowerCase()) || soilType.toLowerCase().includes(s.toLowerCase()));
      if (soilMatch) {
        score += 8;
        reasons.push(`Soil compatibility: Ideal match for ${soilType}.`);
      } else {
        score -= 10;
        reasons.push(`Sub-optimal soil texture: ${soilType} requires active aeration management.`);
      }

      // 2. pH Match
      const phVal = Number(soilPh) || 6.8;
      if (phVal >= crop.ideal_ph_range[0] && phVal <= crop.ideal_ph_range[1]) {
        score += 6;
        reasons.push(`Favorable pH: Current pH ${phVal} matches optimal assimilation bracket (${crop.ideal_ph_range[0]}–${crop.ideal_ph_range[1]}).`);
      } else {
        score -= 8;
        reasons.push(`pH caution: Soil pH ${phVal} is outside preferred range (${crop.ideal_ph_range[0]}–${crop.ideal_ph_range[1]}).`);
      }

      // 3. Season Match
      if (crop.suitable_seasons.includes(season)) {
        score += 5;
        reasons.push(`Seasonal synchronization: Aligned with current ${season} agro-climatic window.`);
      } else {
        score -= 15;
        reasons.push(`Off-season warning: Cultivation outside ${crop.suitable_seasons.join('/')} elevates risk.`);
      }

      // 4. Moisture & Rainfall
      if (crop.water_need_mm.includes('High') && soilMoisture > 55) {
        score += 5;
        reasons.push('Hydrological match: Ample root-zone moisture available for high-water crop.');
      } else if (crop.water_need_mm.includes('Low') && soilMoisture < 45) {
        score += 6;
        reasons.push('Water-saving suitability: Highly resilient in semi-arid and lower soil moisture zones.');
      }

      const finalScore = Math.max(30, Math.min(98, score));

      return {
        name: crop.name,
        scientific_name: crop.scientific_name,
        variety: crop.varieties.join(', '),
        suitability_score: finalScore,
        water_requirement: crop.water_need_mm,
        growing_duration: crop.duration_days,
        suitable_conditions: crop.suitable_conditions,
        potential_risks: crop.common_risks,
        reasons,
        estimated_yield: crop.yield_estimate,
        profit_potential: crop.profit_potential,
      };
    });

    // Sort descending by suitability score
    evaluatedCrops.sort((a, b) => b.suitability_score - a.suitability_score);

    const topCrop = evaluatedCrops[0]?.name || 'Paddy (Rice)';
    const topScore = evaluatedCrops[0]?.suitability_score || 90;
    const rationale = `Based on your ${soilType} soil, pH of ${soilPh}, and ${season} season conditions, ${topCrop} demonstrates the highest agro-climatic suitability (${topScore}% index).`;

    return NextResponse.json({
      success: true,
      recommendations: evaluatedCrops,
      evaluated_crops: evaluatedCrops,
      top_crop: topCrop,
      agronomic_rationale: rationale,
      environmental_snapshot: {
        soil_type: soilType,
        soil_ph: soilPh,
        soil_moisture: soilMoisture,
        season,
        rainfall_forecast: rainfallForecast,
        temperature,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/ai/recommend error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Crop recommendation calculation failed.' },
      { status: 500 }
    );
  }
}

