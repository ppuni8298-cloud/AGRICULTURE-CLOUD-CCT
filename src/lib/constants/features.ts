export interface FeatureItem {
  id: string;
  number: number;
  title: string;
  category: string;
  iconName: string;
  shortDescription: string;
  detailedDescription: string;
  architectureDetails: string[];
  status: 'Active in Phase 1' | 'Planned in Phase 2' | 'Planned in Phase 3' | 'Planned in Phase 4';
  isPhase1: boolean;
}

export const PLATFORM_FEATURES: FeatureItem[] = [
  {
    id: 'ai-assistant',
    number: 1,
    title: 'AI Agriculture Assistant',
    category: 'Intelligence',
    iconName: 'Bot',
    shortDescription: 'Multilingual conversational agronomy agent answering farmer queries on pests, crops, and fertilizers.',
    detailedDescription: 'An LLM-driven agricultural advisory system tuned on agronomic textbooks, ICAR packages of practices, and state university crop calendars.',
    architectureDetails: [
      'Prompt-engineered agronomic guardrails preventing toxic pesticide recommendations',
      'Multilingual token translation pipeline across 12 Indian regional scripts',
      'Contextualized farm memory storing crop variety, soil pH, and sowing dates'
    ],
    status: 'Active in Phase 1',
    isPhase1: true,
  },
  {
    id: 'crop-disease-detection',
    number: 2,
    title: 'Crop Disease Detection',
    category: 'Computer Vision',
    iconName: 'ScanEye',
    shortDescription: 'Edge and cloud computer vision to classify fungal, bacterial, and pest infestations from leaf photographs.',
    detailedDescription: 'Upload a leaf photo from smartphone or tablet. The multi-class CNN pipeline diagnoses foliar pathogens and provides IPM curative protocols.',
    architectureDetails: [
      'ResNet-50 and EfficientNet-B4 fine-tuned on PlantVillage and Indian field datasets',
      'Integrated Grad-CAM visual heatmaps verifying symptom regions',
      'Supabase Storage foundation for secure image retention and audit trails'
    ],
    status: 'Active in Phase 1',
    isPhase1: true,
  },
  {
    id: 'smart-farm-monitoring',
    number: 3,
    title: 'Smart Farm Monitoring',
    category: 'Farm Operations',
    iconName: 'Activity',
    shortDescription: 'Centralized telemetry dashboard for multi-plot holdings tracking field status, crop age, and activities.',
    detailedDescription: 'Enables farmers and consultants to organize acreage into segmented field plots, track sowing dates, crop stages, and input logs.',
    architectureDetails: [
      'Relational hierarchy: Farmer -> Farms -> Fields -> Crop Cycles',
      'Real-time status tracking for irrigation, fertilization, and weeding',
      'Optimistic state synchronization for low-bandwidth rural connections'
    ],
    status: 'Active in Phase 1',
    isPhase1: true,
  },
  {
    id: 'mandi-intelligence',
    number: 4,
    title: 'All-India Mandi Intelligence',
    category: 'Market & Trade',
    iconName: 'TrendingUp',
    shortDescription: 'Transparent price discovery, modal rates, and market arrivals across nationwide APMC yards.',
    detailedDescription: 'Empowers Indian farmers with transparent commodity benchmarks, historical trends, and price spread comparisons across neighboring markets.',
    architectureDetails: [
      'Normalized commodity taxonomy across regional naming conventions',
      'Aggregated min, max, and modal price calculations per quintal',
      'Phase 1 interactive dataset with Phase 2 e-NAM / Agmarknet automated ETL ingestion'
    ],
    status: 'Active in Phase 1',
    isPhase1: true,
  },
  {
    id: 'weather-intelligence',
    number: 5,
    title: 'Weather Intelligence',
    category: 'Climate & Sensors',
    iconName: 'CloudSunRain',
    shortDescription: 'Hyperlocal micro-weather forecasts, monsoon tracking, and automated agricultural spray advisories.',
    detailedDescription: 'Combines satellite rainfall data, IMD monsoon radars, and localized weather APIs to give farmers 7-day actionable spray windows.',
    architectureDetails: [
      'Precipitation probability, relative humidity, and wind speed monitoring',
      'Spray drift risk score calculation preventing agrochemical run-off',
      'Localized frost, heatwave, and heavy downpour SMS alert triggers'
    ],
    status: 'Active in Phase 1',
    isPhase1: true,
  },
  {
    id: 'smart-irrigation',
    number: 6,
    title: 'Smart Irrigation',
    category: 'Water Resource',
    iconName: 'Droplets',
    shortDescription: 'Evapotranspiration calculations and soil moisture scheduling to minimize groundwater consumption.',
    detailedDescription: 'Computes crop water requirements using the FAO-56 Penman-Monteith method, delivering scheduled valve actuation times.',
    architectureDetails: [
      'Penman-Monteith ET0 calculation based on solar radiation, temperature, and wind',
      'Crop coefficient (Kc) dynamic curves for cereals, pulses, and horticulture',
      'Integration foundation for LoRaWAN / GSM soil moisture probe telemetry'
    ],
    status: 'Planned in Phase 2',
    isPhase1: false,
  },
  {
    id: 'digital-farm-twin',
    number: 7,
    title: 'Digital Farm Twin',
    category: 'Simulation',
    iconName: 'Cpu',
    shortDescription: 'Virtual 3D representation of farm plots simulating nitrogen, moisture, and biomass gradients.',
    detailedDescription: 'Creates an interactive digital twin that models hydrological flow, canopy expansion, and root-zone nutrient uptake over the crop cycle.',
    architectureDetails: [
      'Polygon geo-spatial boundary rendering via GeoJSON standards',
      'Simulated spatial heatmaps for soil moisture and organic carbon',
      'Scenario projection: "What if irrigation is delayed by 4 days?"'
    ],
    status: 'Planned in Phase 3',
    isPhase1: false,
  },
  {
    id: 'yield-prediction',
    number: 8,
    title: 'Yield Prediction',
    category: 'Machine Learning',
    iconName: 'BarChart3',
    shortDescription: 'Statistical and machine learning models forecasting harvest tonnage and grade distribution.',
    detailedDescription: 'Correlates growing degree days (GDD), vegetative indices, and input applications to estimate expected yield per acre.',
    architectureDetails: [
      'Gradient Boosting (XGBoost) and Random Forest regression pipelines',
      'Confidence interval calculation factoring weather volatility',
      'Pre-harvest harvest logistics planning and storage reservation'
    ],
    status: 'Planned in Phase 2',
    isPhase1: false,
  },
  {
    id: 'soil-health-analysis',
    number: 9,
    title: 'Soil Health Analysis',
    category: 'Agronomy',
    iconName: 'TestTube',
    shortDescription: 'Digitization of Soil Health Cards, NPK nutrient balancing, and bio-fertilizer recommendations.',
    detailedDescription: 'Parses laboratory soil test reports, detects macro and micronutrient deficiencies, and computes customized fertilizer blends.',
    architectureDetails: [
      'Standardized N-P-K, Electrical Conductivity (EC), and pH evaluation',
      'Soil Health Card automated optical recognition (OCR)',
      'Organic amendment suggestions for restorative soil microbiology'
    ],
    status: 'Planned in Phase 2',
    isPhase1: false,
  },
  {
    id: 'multilingual-voice-assistant',
    number: 10,
    title: 'Multilingual Voice Assistant',
    category: 'Speech & Audio',
    iconName: 'Mic',
    shortDescription: 'Speech-to-text and text-to-speech engine enabling hands-free field advisory in rural accents.',
    detailedDescription: 'Allows farmers working directly in the field to talk to AgroCloud AI without typing, receiving audible guidance in regional vernacular.',
    architectureDetails: [
      'Bhashini AI / Whisper multilingual speech recognition pipeline',
      'Low-latency acoustic models tolerant to outdoor farm background noise',
      'Natural prosody speech synthesis in 12 regional languages'
    ],
    status: 'Planned in Phase 3',
    isPhase1: false,
  },
  {
    id: 'document-intelligence',
    number: 11,
    title: 'Agricultural Document Intelligence',
    category: 'Document AI',
    iconName: 'FileText',
    shortDescription: 'Automated parsing of land records (Pahani / RTC / 7/12), mandi receipts, and fertilizer bills.',
    detailedDescription: 'Converts unstructured physical farming documents into verified digital records using domain-tuned vision models.',
    architectureDetails: [
      'LayoutLM-based field extraction for Indian revenue land documents',
      'Automated extraction of survey numbers, patta details, and acreage',
      'Digital vault with cryptographic hash verification'
    ],
    status: 'Planned in Phase 3',
    isPhase1: false,
  },
  {
    id: 'report-generation',
    number: 12,
    title: 'Report Generation',
    category: 'Analytics',
    iconName: 'Printer',
    shortDescription: 'Downloadable PDF farm health summaries, input audit trails, and bank loan compliance records.',
    detailedDescription: 'Generates professional, printable compliance reports for agricultural bank officers, certification auditors, and cooperative societies.',
    architectureDetails: [
      'Server-side headless PDF rendering engine with localized typography',
      'QR-code verified report authenticity credentials',
      'Historical seasonal performance audits and carbon metric estimates'
    ],
    status: 'Planned in Phase 2',
    isPhase1: false,
  },
  {
    id: 'financial-management',
    number: 13,
    title: 'Farmer Financial Management',
    category: 'Fintech',
    iconName: 'Wallet',
    shortDescription: 'Farm expense ledger, seed & diesel tracking, crop insurance calculations, and KCC monitoring.',
    detailedDescription: 'A simplified agricultural accounting book tracking input purchases, labor wages, machinery rental, and net profitability per harvest.',
    architectureDetails: [
      'Cost-of-cultivation breakdown (A2, A2+FL, C2 methodology)',
      'Kisan Credit Card (KCC) interest subvention reminders',
      'Pradhan Mantri Fasal Bima Yojana (PMFBY) premium estimator'
    ],
    status: 'Planned in Phase 4',
    isPhase1: false,
  },
  {
    id: 'satellite-monitoring',
    number: 14,
    title: 'Satellite Monitoring',
    category: 'Earth Observation',
    iconName: 'Satellite',
    shortDescription: 'Sentinel-2 and Landsat multispectral imagery calculating NDVI, NDRE, and canopy vigor.',
    detailedDescription: 'Monitors vegetative vigor and biomass density from orbit every 5 days, spotting crop stress before visible to the naked eye.',
    architectureDetails: [
      'Normalized Difference Vegetation Index (NDVI) automated computation',
      'Cloud masking and atmospheric correction using ESA Copernicus Hub',
      'Cadastral overlay linking revenue survey plots with satellite pixels'
    ],
    status: 'Planned in Phase 3',
    isPhase1: false,
  },
  {
    id: 'agricultural-marketplace',
    number: 15,
    title: 'Agricultural Marketplace',
    category: 'Commerce',
    iconName: 'Store',
    shortDescription: 'Direct farm-to-buyer network for certified seeds, organic inputs, equipment rental, and produce sales.',
    detailedDescription: 'Connects verified FPOs (Farmer Producer Organizations) directly with bulk institutional buyers, agrochemical dealers, and rental fleets.',
    architectureDetails: [
      'Escrow payment protocols for wholesale commodity trade',
      'Traceability QR tags mapping produce back to source farm plot',
      'Hyperlocal farm machinery sharing (tractors, harvesters, drones)'
    ],
    status: 'Planned in Phase 4',
    isPhase1: false,
  },
  {
    id: 'government-schemes',
    number: 16,
    title: 'Government Schemes Assistant',
    category: 'Public Welfare',
    iconName: 'Landmark',
    shortDescription: 'Rule engine matching farmer landholding, caste, and state with PM-KISAN, subsidies, and grants.',
    detailedDescription: 'Demystifies central and state agricultural subsidy programs, eligibility prerequisites, and application steps in local languages.',
    architectureDetails: [
      'Knowledge base of PM-KISAN, PMKSY, Sub-Mission on Agri Mechanization',
      'Eligibility matching based on land size (Marginal, Small, Medium, Large)',
      'Direct link to state portals (Bhoomi, Mahadbt, Rythu Bharosa, Banglarbhumi)'
    ],
    status: 'Planned in Phase 2',
    isPhase1: false,
  },
];

