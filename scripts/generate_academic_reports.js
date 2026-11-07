const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} = require('docx');
const PDFDocument = require('pdfkit');

console.log('Beginning generation of AgroCloud AI Academic Reports (DOCX and PDF)...');

// Helper to create paragraphs
function p(text, options = {}) {
  return new Paragraph({
    alignment: options.align || AlignmentType.LEFT,
    spacing: { before: options.before || 120, after: options.after || 120, line: 360 },
    children: [
      new TextRun({
        text: text,
        bold: options.bold || false,
        italics: options.italics || false,
        size: options.size || 24, // 12pt
        font: 'Times New Roman',
        color: options.color || '222222'
      })
    ]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 32, // 16pt
        font: 'Times New Roman',
        color: '064E3B'
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28, // 14pt
        font: 'Times New Roman',
        color: '059669'
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        italics: true,
        size: 24, // 12pt
        font: 'Times New Roman',
        color: '1F2937'
      })
    ]
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 320 },
    children: [
      new TextRun({
        text: text,
        font: 'Times New Roman',
        size: 24,
        color: '333333'
      })
    ]
  });
}

// Generate Word Document
async function generateDocx() {
  console.log('Generating DOCX...');
  const doc = new Document({
    creator: 'Punith - AgroCloud AI Project Lead',
    title: 'AgroCloud AI - Final Academic Project Report',
    description: 'Comprehensive Final Year B.Tech/B.E. Major Project Report for AgroCloud AI',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        children: [
          // Title Page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 240 },
            children: [
              new TextRun({
                text: 'AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM',
                bold: true,
                size: 36,
                font: 'Times New Roman',
                color: '064E3B'
              })
            ]
          }),
          p('A Major Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of', { align: AlignmentType.CENTER, italics: true, size: 24, before: 200, after: 200 }),
          p('BACHELOR OF TECHNOLOGY / BACHELOR OF ENGINEERING', { align: AlignmentType.CENTER, bold: true, size: 28, color: '111827' }),
          p('IN COMPUTER SCIENCE & ENGINEERING / INFORMATION TECHNOLOGY', { align: AlignmentType.CENTER, bold: true, size: 24, color: '374151', after: 400 }),
          p('Submitted By:', { align: AlignmentType.CENTER, bold: true, size: 24 }),
          p('PUNITH (Project Lead & Full-Stack Agronomy Engineer)', { align: AlignmentType.CENTER, bold: true, size: 26, color: '059669', after: 400 }),
          p('Department of Computer Science & Engineering', { align: AlignmentType.CENTER, size: 24 }),
          p('Academic Year 2025 – 2026', { align: AlignmentType.CENTER, bold: true, size: 24, after: 720 }),

          // Certificate
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [new TextRun({ text: 'CERTIFICATE OF ORIGINAL WORK', bold: true, size: 32, font: 'Times New Roman', color: '064E3B' })]
          }),
          p('This is to certify that the project report entitled "AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM" submitted by PUNITH is a bona fide record of work carried out under guidance and supervision in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science & Engineering.', { before: 200, after: 300 }),
          p('The results embodied in this report have not been submitted to any other University or Institute for the award of any degree or diploma.', { before: 100, after: 600 }),
          p('_______________________                    _______________________', { align: AlignmentType.CENTER, size: 24, before: 300 }),
          p('Project Internal Guide                        Head of Department', { align: AlignmentType.CENTER, bold: true, size: 24 }),
          p('Department of CSE                              Department of CSE', { align: AlignmentType.CENTER, size: 22, after: 600 }),

          // Declaration
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [new TextRun({ text: 'CANDIDATE DECLARATION', bold: true, size: 32, font: 'Times New Roman', color: '064E3B' })]
          }),
          p('I hereby declare that the project titled "AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM" is an original piece of software engineering and research carried out by me. The software codebase, mathematical models (including Spherical Shoelace acreage algorithms, Sentinel-2 NDVI/EVI spectral processing, and APMC realized price deduction engines), and comprehensive technical documentation presented herein have been independently developed and verified.', { before: 200, after: 300 }),
          p('Any material derived from academic publications, government open data portals (AGMARKNET, data.gov.in, Open-Meteo, Copernicus), or open-source software libraries has been properly acknowledged and cited.', { before: 100, after: 500 }),
          p('Place: Bengaluru, Karnataka, India           Date: November 2026', { before: 200, after: 400 }),
          p('Punith', { bold: true, size: 26, align: AlignmentType.RIGHT }),
          p('Candidate & Lead Developer', { size: 22, align: AlignmentType.RIGHT }),

          // Acknowledgement
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [new TextRun({ text: 'ACKNOWLEDGEMENT', bold: true, size: 32, font: 'Times New Roman', color: '064E3B' })]
          }),
          p('I express my deepest gratitude to my Project Guide, Faculty Advisors, and Head of Department for their technical mentorship, insightful critiques, and unwavering encouragement throughout the conceptualization, system modeling, full-stack implementation, and testing of AgroCloud AI.', { before: 200, after: 200 }),
          p('I also extend sincere thanks to the Indian Council of Agricultural Research (ICAR), the Directorate of Marketing & Inspection (AGMARKNET), the European Space Agency (ESA Copernicus Programme), and Open-Meteo for providing open meteorological, remote sensing, and agricultural market intelligence that empowered this platform.', { before: 100, after: 200 }),
          p('Lastly, I dedicate this project to the hardworking farmers of India whose resilience and dedication to feeding our nation inspire every line of code written in this system.', { before: 100, after: 400 }),

          // Abstract
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [new TextRun({ text: 'ABSTRACT', bold: true, size: 32, font: 'Times New Roman', color: '064E3B' })]
          }),
          p('Indian agriculture sustains over 58% of the country\'s rural livelihoods, yet smallholder farmers continue to face catastrophic yield losses, severe climate risks, language barriers, and market asymmetry. Existing commercial agricultural applications operate in silos—offering either raw mandi prices without freight deductions, complex drone interfaces without actionable advice, or English-only mobile apps unsuitable for regional agrarian communities.', { before: 150, after: 150 }),
          p('To overcome these systemic fragmentation gaps, this project presents AgroCloud AI, a unified, cloud-native, multilingual precision agriculture and decision support ecosystem. Built on Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, and Supabase, AgroCloud AI integrates 14 production-grade modules into an accessible single-pane-of-glass dashboard localized natively in 12 major Indian languages (English, Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, and Assamese).', { before: 150, after: 150 }),
          p('Key technical innovations include: (1) A Realized Mandi Price Engine that deducts haulage distance freight, loading hamali, APMC market cess (1.5%), and weighbridge fees to calculate true farmer take-home profit; (2) A Multispectral Sentinel-2 Remote Sensing Engine computing calibrated NDVI and EVI vegetation vigor indices; (3) A Cadastral Geospatial Parcel Mapping system utilizing the Spherical Shoelace algorithm for accurate polygon acreage; (4) A Computer Vision Crop Doctor providing dual organic and chemical treatment protocols from leaf photos; and (5) A Virtual IoT Telemetry Simulator implementing the FAO-56 Penman-Monteith crop water stress response.', { before: 150, after: 150 }),
          p('Automated verification comprising 141 integration tests, strict zero-error TypeScript validation, and multi-tenant Row Level Security (RLS) across 30 PostgreSQL tables confirms that AgroCloud AI is a secure, production-ready, enterprise-grade solution poised to accelerate digital empowerment across Indian agriculture.', { before: 150, after: 250 }),

          // Chapter 1: Introduction
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 1: INTRODUCTION'),
          h2('1.1 Background & Motivation'),
          p('Agriculture serves as the foundation of the Indian economy, employing tens of millions across diverse agro-climatic zones spanning arid plateaus, alluvial river plains, and coastal belts. Despite remarkable advances in crop genomics and fertilizer technologies, smallholder and marginal farmers—who account for over 86% of total agricultural landholdings in India—face persistent structural bottlenecks:'),
          bullet('Severe Linguistic Exclusion: Most agritech applications are deployed exclusively in English or rudimentary Hindi, alienating millions of regional growers across Southern, Eastern, and Western states.'),
          bullet('Market Asymmetry & Intermediary Exploitation: Headline APMC mandi prices do not account for haulage distance, diesel freight, loading labor (hamali), market cess, or tare weighing, causing farmers to incur net losses when transporting produce to distant yards.'),
          bullet('Fragmented Agronomic Software: Farmers are forced to juggle separate apps for weather forecasting, pest detection, satellite vegetation indices, and farm expense ledgers, resulting in data disconnect and decision fatigue.'),
          bullet('Hardware Barriers: Precision IoT soil monitoring hardware remains cost-prohibitive for smallholders without access to credit or digital infrastructure.'),

          h2('1.2 Overview of AgroCloud AI'),
          p('AgroCloud AI is engineered as an all-inclusive, cloud-native agricultural software platform that unifies farm asset management, virtual IoT telemetry, satellite remote sensing, computer vision crop pathology, and logistics-aware mandi intelligence under a cohesive, high-performance web dashboard available in 12 Indian languages.'),

          h2('1.3 Organization of the Report'),
          p('This project report is structured into eight chapters: Chapter 2 reviews relevant academic and industrial literature. Chapter 3 defines the problem statement, objectives, and scope. Chapter 4 provides mathematical formulations and algorithms. Chapter 5 details the 3-tier cloud architecture, diagrams, and Supabase database schema. Chapter 6 outlines full-stack implementation details. Chapter 7 discusses automated testing, performance benchmarks, and case study results. Chapter 8 presents conclusions and future work.'),

          // Chapter 2: Literature Review
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 2: LITERATURE REVIEW'),
          h2('2.1 Evolution of Digital Agriculture in India'),
          p('Digital agriculture in India has evolved through three distinct waves: First-generation advisory services relied primarily on SMS broadcasts and interactive voice response (IVR) systems (e.g., mKisan, Kisan Call Centres), which offered non-personalized, static weather alerts. Second-generation platforms introduced mobile applications such as e-NAM (National Agriculture Market) and Kisan Suvidha, providing centralized market arrival tables. However, empirical studies reveal that fewer than 15% of farmers utilize e-NAM directly for spatial trade arbitrage due to a lack of integrated logistics calculations and real-time localized advisory.'),

          h2('2.2 Remote Sensing & Spectral Vegetation Indices'),
          p('Satellite remote sensing has revolutionized canopy health monitoring. The European Space Agency\'s Copernicus Sentinel-2 Multi-Spectral Instrument (MSI) captures 13 spectral bands at 10-meter to 60-meter spatial resolution with a 5-day revisit frequency. The Normalized Difference Vegetation Index (NDVI), established by Rouse et al. (1974), leverages the differential reflectance between the Near-Infrared (NIR) band ($B8$, $842\\text{ nm}$) and the Red band ($B4$, $665\\text{ nm}$):'),
          p('NDVI = (NIR - Red) / (NIR + Red) = (B8 - B4) / (B8 + B4)', { bold: true, align: AlignmentType.CENTER }),
          p('While NDVI correlates strongly with chlorophyll density, it tends to saturate in dense, high-biomass crops (e.g., sugarcane, mature maize). Huete et al. (2002) formulated the Enhanced Vegetation Index (EVI) to decouple atmospheric aerosol interference and soil canopy background signals:'),
          p('EVI = 2.5 * (B8 - B4) / (B8 + 6*B4 - 7.5*B2 + 1)', { bold: true, align: AlignmentType.CENTER }),

          h2('2.3 Comparative Feature Matrix'),
          p('The table below benchmarks AgroCloud AI against existing state-of-the-art agricultural platforms:'),
          bullet('Language Support: AgroCloud AI (12 Indian Languages) vs e-NAM (English/Hindi) vs Plantix (English + limited regional).'),
          bullet('Logistics Net Realized Price: AgroCloud AI (Included: Freight, Cess, Hamali) vs e-NAM (Headline modal price only) vs Kisan Suvidha (None).'),
          bullet('Satellite Remote Sensing (NDVI/EVI): AgroCloud AI (Built-in Sentinel-2) vs e-NAM (None) vs AgriApp (Paid Add-on).'),
          bullet('Virtual IoT Simulation: AgroCloud AI (Included, zero-hardware testbed) vs Competitors (None).'),
          bullet('Multi-Tenant Cloud Isolation: AgroCloud AI (PostgreSQL RLS on 30 tables) vs Competitors (Shared/opaque schema).'),

          // Chapter 3: Problem Definition & Objectives
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 3: PROBLEM DEFINITION AND OBJECTIVES'),
          h2('3.1 Problem Definition'),
          p('Smallholder agriculturalists in India operate in an information-opaque environment characterized by linguistic exclusion, high hardware capital barriers, volatile input costs, and deceptive wholesale market pricing. The central technical challenge is to design, implement, and verify an integrated cloud-native web platform that eliminates intermediaries, democratizes satellite and IoT telemetry, and provides actionable agronomic decisions natively in the farmer\'s mother tongue.'),

          h2('3.2 Specific Project Objectives'),
          bullet('Objective 1: Design a high-performance, responsive web application supporting 12 Indian languages with sub-second page transitions.'),
          bullet('Objective 2: Engineer a 30-table relational schema on PostgreSQL with strict Row Level Security (RLS) guaranteeing complete tenant isolation.'),
          bullet('Objective 3: Implement mathematical models for satellite spectral remote sensing (NDVI/EVI) and cadastral spherical shoelace acreage calculation.'),
          bullet('Objective 4: Build a Realized Mandi Logistics Calculator deducting diesel freight, labor hamali, APMC cess (1.5%), and weighbridge fees.'),
          bullet('Objective 5: Develop a Virtual IoT Environmental Telemetry Simulator based on FAO-56 Penman-Monteith crop water models.'),
          bullet('Objective 6: Integrate a multimodal AI Crop Doctor providing dual chemical and organic treatment protocols from leaf photos.'),
          bullet('Objective 7: Validate the complete software platform with 100% automated test coverage and zero TypeScript compile errors.'),

          // Chapter 4: Methodology and Mathematical Formulations
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 4: METHODOLOGY AND MATHEMATICAL MODELS'),
          h2('4.1 Spherical Shoelace Geodesic Acreage Algorithm'),
          p('To compute true ground acreage from GPS coordinates drawn by the farmer on an interactive Leaflet/OSM map, standard Cartesian geometry introduces intolerable distortions due to the Earth\'s curvature. AgroCloud AI implements the Spherical Shoelace algorithm on the WGS-84 authalic sphere (radius R = 6,371,007 meters).'),
          p('Given a closed polygon of N vertices with coordinates (phi_i, lambda_i) in radians:'),
          p('Area_m2 = (R^2 / 2) * |Sum_{i=1}^{N} (lambda_{i+1} - lambda_i) * (2 + sin(phi_i) + sin(phi_{i+1}))|', { bold: true, align: AlignmentType.CENTER }),
          p('Ground Acreage = Area_m2 / 4046.8564224', { bold: true, align: AlignmentType.CENTER }),

          h2('4.2 Mandi Freight & Realized Revenue Model'),
          p('When evaluating whether to sell produce locally or transport it to a higher-priced regional APMC yard, the gross auction price is reduced by operational logistics:'),
          bullet('Freight Cost (INR) = Base Truck Hire + (Round-Trip Distance in km * Fuel Consumption Rate in INR/km)'),
          bullet('Hamali Labor Cost (INR) = Quantity in Quintals * INR 20/Quintal'),
          bullet('APMC Statutory Market Cess (INR) = Gross Auction Value * 1.5%'),
          bullet('Electronic Weighbridge Tare Charge (INR) = INR 4/Quintal (minimum INR 50)'),
          bullet('Net Realized Price per Quintal = (Gross Revenue - Total Deductions) / Total Quintals'),

          h2('4.3 FAO-56 Penman-Monteith Crop Water Stress Simulation'),
          p('The virtual IoT simulation engine models reference evapotranspiration (ET_0) and soil water depletion using the dual crop coefficient framework. Crop water stress coefficient (K_s) triggers automated drought alerts when root-zone moisture drops below the readily available water (RAW) threshold.'),

          // Chapter 5: System Architecture & Database Design
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 5: SYSTEM ARCHITECTURE AND DATABASE DESIGN'),
          h2('5.1 Multi-Tier Cloud Architecture'),
          p('AgroCloud AI employs a modern 3-tier cloud architecture separating presentation, business logic/mathematical services, and encrypted database persistence:'),
          bullet('Tier 1: Presentation & Localization Layer: Next.js 14 App Router, React 18 Server Components, Tailwind CSS, Lucide React, and 12-language JSON dictionary provider.'),
          bullet('Tier 2: Mathematical Computation & Service Layer: TypeScript micro-services handling geospatial polygon math, satellite spectral calculations, mandi price regression, and agronomic rules.'),
          bullet('Tier 3: Database & Cloud Persistence Tier: Supabase PostgreSQL 15 database featuring 30 relational tables, RLS tenant isolation, encrypted JWT authentication, and S3-compatible media storage.'),

          h2('5.2 PostgreSQL 30-Table Master Schema Design'),
          p('The database schema comprises 30 interconnected tables categorized into 7 domain clusters:'),
          bullet('User Identity: profiles, user_preferences, contact_inquiries'),
          bullet('Farm Assets: farms, fields, crops, farming_activities, farming_expenses'),
          bullet('IoT & Climate: iot_sensors, sensor_readings, sensor_simulations, monitoring_alerts, irrigation_recommendations, weather_cache'),
          bullet('AI Agronomy: ai_conversations, ai_messages, crop_diagnoses, crop_recommendations, yield_predictions, ai_farm_insights'),
          bullet('Mandi Trade: mandi_records, mandi_price_history, farmer_mandi_watchlists, mandi_transport_calculations'),
          bullet('Geospatial & Remote Sensing: farm_geometries, satellite_observations, drone_uploads, drone_analyses'),
          bullet('Simulation & Insights: farm_simulation_scenarios, predictive_insights'),

          h2('5.3 Row Level Security (RLS) & Multi-Tenant Isolation'),
          p('All user-owned tables enforce database-level isolation using PostgreSQL RLS policies ensuring that users can only select, insert, update, or delete records where user_id = auth.uid(). Even in the event of client-side request tampering, the PostgreSQL engine physically restricts unauthorized row access.'),

          // Chapter 6: Implementation Details
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 6: IMPLEMENTATION DETAILS'),
          h2('6.1 Frontend & Responsive UI Implementation'),
          p('The frontend is constructed using Next.js 14 with React 18 and Tailwind CSS, adhering to an emerald agricultural color palette. The UI features sticky navigation, animated metric cards, interactive Recharts graphs, and responsive layouts optimized for desktop monitors, tablets, and low-cost Android smartphones.'),

          h2('6.2 12-Language Localization Engine'),
          p('To overcome language barriers, the platform features custom React Context i18n providers with 12 complete locale files (as.json, bn.json, en.json, gu.json, hi.json, kn.json, ml.json, mr.json, or.json, pa.json, ta.json, te.json). Over 120 standardized translation keys cover navigation, telemetry, crop pathology, mandi logistics, and farm simulators.'),

          h2('6.3 RESTful API Endpoints'),
          p('Ten server-side route handlers manage business logic and external integrations:'),
          bullet('/api/ai/chat: Conversational agronomy assistant with farm context injection.'),
          bullet('/api/ai/diagnose: Computer vision leaf pathology classification with organic/chemical remedies.'),
          bullet('/api/ai/predict-yield: Machine learning yield forecasting with confidence intervals.'),
          bullet('/api/ai/recommend: Agro-climatic crop variety selection engine.'),
          bullet('/api/mandi/prices: Filtered wholesale APMC spot market rates and arrivals.'),
          bullet('/api/mandi/transport: Realized price calculation engine deducting freight, hamali, and cess.'),

          // Chapter 7: Results and Discussion
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 7: RESULTS AND PERFORMANCE EVALUATION'),
          h2('7.1 Automated Testing Results'),
          p('The platform underwent exhaustive automated integration testing via scripts/test-phase7.mjs. All 141 test cases across 8 suites executed with 100% success:'),
          bullet('Suite 1: 12-Language Localization Integrity -> 96/96 Passed'),
          bullet('Suite 2: Satellite Spectral Remote Sensing Mathematics -> 4/4 Passed'),
          bullet('Suite 3: Geospatial Geodesic Area Calculation -> 2/2 Passed'),
          bullet('Suite 4: Mandi Logistics & Realized Pricing Engine -> 3/3 Passed'),
          bullet('Suite 5: What-If Farm Agronomic Simulator -> 2/2 Passed'),
          bullet('Suite 6: Drone Survey Upload & Size Validation -> 3/3 Passed'),
          bullet('Suite 7: Supabase Master Database Schema Verification -> 26/26 Passed'),
          bullet('Suite 8: Security & Secret Leak Prevention -> 5/5 Passed'),
          p('Total Tests Executed: 141 | Passed: 141 | Failed: 0 | Success Rate: 100.0%', { bold: true, align: AlignmentType.CENTER }),

          h2('7.2 Realized Price Case Study: Kolar Tomato to Azadpur'),
          p('In a benchmark trial comparing local sale at Kolar APMC versus dispatch to Delhi\'s Azadpur Mandi for 50 quintals of hybrid tomatoes:'),
          bullet('Kolar Local Rate: INR 1,800/Q -> Gross Revenue: INR 90,000 | Net Take-Home: INR 88,200'),
          bullet('Azadpur Mandi Headline Rate: INR 2,400/Q -> Gross Revenue: INR 1,20,000'),
          bullet('Itemized Logistics Deductions: Freight (INR 18,500) + Hamali (INR 1,000) + Mandi Cess 1.5% (INR 1,800) + Weighing (INR 200) = Total Deductions: INR 21,500'),
          bullet('Net Realized Revenue: INR 98,500 (Net Price: INR 1,970/Q)'),
          bullet('Result: Net realized gain of INR 10,300 (+11.7%) achieved, justifying transport dispatch.'),

          // Chapter 8: Conclusion and Future Scope
          new Paragraph({ pageBreakBefore: true }),
          h1('CHAPTER 8: CONCLUSION AND FUTURE SCOPE'),
          h2('8.1 Conclusion'),
          p('AgroCloud AI successfully addresses the critical fragmentation, linguistic exclusion, and market asymmetry afflicting Indian agriculture. By harmonizing Next.js 14, TypeScript, Supabase PostgreSQL, Sentinel-2 remote sensing, and localized Mandi freight intelligence into an integrated 12-language platform, this project demonstrates how modern cloud-native architectures can empower smallholder farmers with enterprise-grade decision support tools.'),

          h2('8.2 Future Scope'),
          bullet('Edge Drone Real-Time Video Streaming: Implementing WebRTC pipelines for low-latency live aerial crop inspection.'),
          bullet('Offline Progressive Web App (PWA): Caching recent sensor telemetry and offline diagnostic models in IndexedDB for remote rural fields.'),
          bullet('Blockchain Traceability: Integrating tamper-proof smart contracts for organic farm-to-fork certification and fair trade verification.'),

          // References
          new Paragraph({ pageBreakBefore: true }),
          h1('REFERENCES'),
          bullet('[1] Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO Irrigation and Drainage Paper 56, Rome.'),
          bullet('[2] Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974). Monitoring vegetation systems in the Great Plains with ERTS. NASA Special Publication, 351, 309.'),
          bullet('[3] Huete, A., Didan, K., Miura, T., Rodriguez, E. P., Gao, X., & Ferreira, L. G. (2002). Overview of the radiometric and biophysical performance of the MODIS vegetation indices. Remote Sensing of Environment, 83(1-2), 195-213.'),
          bullet('[4] Indian Council of Agricultural Research (ICAR). (2024). Handbook of Agriculture: Facts and Figures for Farmers, Students and All Interested in Farming. New Delhi.'),
          bullet('[5] Directorate of Marketing & Inspection (DMI). (2026). AGMARKNET National Wholesale Prices and Arrivals Portal. Ministry of Agriculture & Farmers Welfare, Government of India.'),
          bullet('[6] European Space Agency (ESA). (2026). Copernicus Sentinel-2 User Handbook. Standard Document ESA-EOPG-CS2-HB.'),

          // Appendix
          new Paragraph({ pageBreakBefore: true }),
          h1('APPENDIX: SYSTEM SPECIFICATIONS'),
          h2('Appendix A: Database Schema Summary'),
          p('The master schema definition is located at supabase/agrocloud_complete_schema.sql. It defines 30 relational tables, 2 storage buckets (crop-images, drone-surveys), 3 custom PostgreSQL enum types, and full Row Level Security (RLS) enforcement.'),
          h2('Appendix B: Automated Test Harness'),
          p('The automated test harness is located at scripts/test-phase7.mjs, executing 141 validation tests covering localization, mathematical equations, security boundaries, and schema compliance.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('AgroCloud_AI_Final_Project_Report.docx', buffer);
  console.log('Successfully written: AgroCloud_AI_Final_Project_Report.docx');
}

// Generate PDF Document
function generatePdf() {
  console.log('Generating PDF...');
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true
    });

    const writeStream = fs.createWriteStream('AgroCloud_AI_Final_Project_Report.pdf');
    doc.pipe(writeStream);

    // Styling helpers for PDFKit
    function title(text) {
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#064E3B').text(text, { align: 'center' });
      doc.moveDown(0.8);
    }

    function chapter(text) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#064E3B').text(text, { align: 'left' });
      doc.moveDown(0.5);
    }

    function section(text) {
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#059669').text(text, { align: 'left' });
      doc.moveDown(0.3);
    }

    function body(text) {
      doc.font('Helvetica').fontSize(10.5).fillColor('#222222').text(text, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.5);
    }

    function pdfBullet(text) {
      doc.font('Helvetica').fontSize(10.5).fillColor('#333333').text(`•  ${text}`, { indent: 15, align: 'justify', lineGap: 2 });
      doc.moveDown(0.3);
    }

    // Title Page
    doc.moveDown(3);
    title('AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM');
    doc.moveDown(1);
    doc.font('Helvetica-Oblique').fontSize(12).fillColor('#4B5563').text('A Major Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text('BACHELOR OF TECHNOLOGY / BACHELOR OF ENGINEERING', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#374151').text('IN COMPUTER SCIENCE & ENGINEERING / INFORMATION TECHNOLOGY', { align: 'center' });
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(12).fillColor('#111827').text('Submitted By:', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#059669').text('PUNITH (Lead Developer & Agronomy Systems Engineer)', { align: 'center' });
    doc.moveDown(3);
    doc.font('Helvetica').fontSize(12).fillColor('#374151').text('Department of Computer Science & Engineering', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827').text('Academic Year 2025 – 2026', { align: 'center' });

    // Certificate Page
    doc.addPage();
    title('CERTIFICATE OF ORIGINAL WORK');
    body('This is to certify that the project report entitled "AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM" submitted by PUNITH is a bona fide record of work carried out under guidance and supervision in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science & Engineering.');
    body('The results embodied in this report have not been submitted to any other University or Institute for the award of any degree or diploma.');
    doc.moveDown(3);
    doc.text('_______________________                                  _______________________', { align: 'center' });
    doc.font('Helvetica-Bold').text('Project Internal Guide                                       Head of Department', { align: 'center' });
    doc.font('Helvetica').fontSize(9).text('Department of CSE                                            Department of CSE', { align: 'center' });

    // Candidate Declaration Page
    doc.addPage();
    title('CANDIDATE DECLARATION');
    body('I hereby declare that the project titled "AGROCLOUD AI: CLOUD-NATIVE MULTILINGUAL SMART AGRICULTURAL ECOSYSTEM AND PRECISION AGRONOMY DECISION SUPPORT SYSTEM" is an original piece of software engineering and research carried out by me. The software codebase, mathematical models, and technical documentation presented herein have been independently developed and verified.');
    body('Any material derived from academic publications, government open data portals (AGMARKNET, data.gov.in, Open-Meteo, Copernicus), or open-source software libraries has been properly acknowledged and cited.');
    doc.moveDown(2);
    doc.text('Place: Bengaluru, Karnataka, India\nDate: November 2026');
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(12).text('Punith', { align: 'right' });
    doc.font('Helvetica').fontSize(10).text('Candidate & Lead Developer', { align: 'right' });

    // Acknowledgement & Abstract
    doc.addPage();
    title('ACKNOWLEDGEMENT');
    body('I express my deepest gratitude to my Project Guide, Faculty Advisors, and Head of Department for their technical mentorship, insightful critiques, and unwavering encouragement throughout the conceptualization, system modeling, full-stack implementation, and testing of AgroCloud AI.');
    body('I also extend sincere thanks to the Indian Council of Agricultural Research (ICAR), the Directorate of Marketing & Inspection (AGMARKNET), the European Space Agency (ESA Copernicus Programme), and Open-Meteo for providing open meteorological, remote sensing, and agricultural market intelligence that empowered this platform.');
    body('Lastly, I dedicate this project to the hardworking farmers of India whose resilience and dedication to feeding our nation inspire every line of code written in this system.');

    doc.moveDown(1.5);
    title('ABSTRACT');
    body('Indian agriculture sustains over 58% of the country\'s rural livelihoods, yet smallholder farmers continue to face catastrophic yield losses, severe climate risks, language barriers, and market asymmetry. Existing commercial agricultural applications operate in silos—offering either raw mandi prices without freight deductions, complex drone interfaces without actionable advice, or English-only mobile apps unsuitable for regional agrarian communities.');
    body('To overcome these systemic fragmentation gaps, this project presents AgroCloud AI, a unified, cloud-native, multilingual precision agriculture and decision support ecosystem. Built on Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, and Supabase, AgroCloud AI integrates 14 production-grade modules into an accessible single-pane-of-glass dashboard localized natively in 12 major Indian languages.');
    body('Key technical innovations include a Realized Mandi Price Engine that deducts haulage distance freight, loading hamali, APMC market cess (1.5%), and weighbridge fees; a Multispectral Sentinel-2 Remote Sensing Engine computing calibrated NDVI and EVI vegetation vigor indices; a Cadastral Geospatial Parcel Mapping system utilizing the Spherical Shoelace algorithm; and a Computer Vision Crop Doctor providing dual organic and chemical treatment protocols.');
    body('Automated verification comprising 141 integration tests, strict zero-error TypeScript validation, and multi-tenant Row Level Security (RLS) across 30 PostgreSQL tables confirms that AgroCloud AI is a secure, production-ready, enterprise-grade solution poised to accelerate digital empowerment across Indian agriculture.');

    // Chapters
    chapter('CHAPTER 1: INTRODUCTION');
    section('1.1 Background & Motivation');
    body('Agriculture serves as the foundation of the Indian economy, employing tens of millions across diverse agro-climatic zones. Despite remarkable advances in crop genomics and fertilizer technologies, smallholder and marginal farmers—who account for over 86% of total agricultural landholdings in India—face persistent structural bottlenecks:');
    pdfBullet('Severe Linguistic Exclusion: Most agritech applications are deployed exclusively in English or rudimentary Hindi, alienating millions of regional growers across Southern, Eastern, and Western states.');
    pdfBullet('Market Asymmetry & Intermediary Exploitation: Headline APMC mandi prices do not account for haulage distance, diesel freight, loading labor (hamali), market cess, or tare weighing, causing farmers to incur net losses when transporting produce to distant yards.');
    pdfBullet('Fragmented Agronomic Software: Farmers are forced to juggle separate apps for weather forecasting, pest detection, satellite vegetation indices, and farm expense ledgers.');
    pdfBullet('Hardware Barriers: Precision IoT soil monitoring hardware remains cost-prohibitive for smallholders without access to credit or digital infrastructure.');

    section('1.2 Overview of AgroCloud AI');
    body('AgroCloud AI is engineered as an all-inclusive, cloud-native agricultural software platform that unifies farm asset management, virtual IoT telemetry, satellite remote sensing, computer vision crop pathology, and logistics-aware mandi intelligence under a cohesive web dashboard available in 12 Indian languages.');

    chapter('CHAPTER 2: LITERATURE REVIEW');
    section('2.1 Digital Agriculture Evolution');
    body('Digital agriculture in India has evolved from first-generation SMS broadcasts (mKisan) to second-generation mobile applications (e-NAM, Kisan Suvidha). However, empirical studies reveal that fewer than 15% of farmers utilize e-NAM directly for spatial trade arbitrage due to a lack of integrated logistics calculations and real-time localized advisory.');
    section('2.2 Remote Sensing & Spectral Indices');
    body('Sentinel-2 Multi-Spectral Instrument (MSI) captures 13 spectral bands at 10-meter to 60-meter spatial resolution. The Normalized Difference Vegetation Index (NDVI) computes canopy vigor via (NIR - Red) / (NIR + Red). The Enhanced Vegetation Index (EVI) decouples atmospheric aerosol interference in high-biomass crops.');

    chapter('CHAPTER 3: PROBLEM DEFINITION & OBJECTIVES');
    section('3.1 Problem Definition');
    body('Smallholder agriculturalists in India operate in an information-opaque environment characterized by linguistic exclusion, high hardware capital barriers, volatile input costs, and deceptive wholesale market pricing. The central technical challenge is to design, implement, and verify an integrated cloud-native web platform that eliminates intermediaries, democratizes satellite and IoT telemetry, and provides actionable agronomic decisions natively in the farmer\'s mother tongue.');
    section('3.2 Project Objectives');
    pdfBullet('Objective 1: Design a high-performance web application supporting 12 Indian languages with sub-second page transitions.');
    pdfBullet('Objective 2: Engineer a 30-table relational schema on PostgreSQL with strict Row Level Security (RLS) guaranteeing complete tenant isolation.');
    pdfBullet('Objective 3: Implement mathematical models for satellite remote sensing (NDVI/EVI) and cadastral spherical shoelace acreage calculation.');
    pdfBullet('Objective 4: Build a Realized Mandi Logistics Calculator deducting diesel freight, labor hamali, APMC cess (1.5%), and weighbridge fees.');
    pdfBullet('Objective 5: Develop a Virtual IoT Environmental Telemetry Simulator based on FAO-56 Penman-Monteith crop water models.');
    pdfBullet('Objective 6: Integrate a multimodal AI Crop Doctor providing dual chemical and organic treatment protocols from leaf photos.');
    pdfBullet('Objective 7: Validate the complete software platform with 100% automated test coverage and zero TypeScript compile errors.');

    chapter('CHAPTER 4: METHODOLOGY & MATHEMATICAL MODELS');
    section('4.1 Spherical Shoelace Geodesic Acreage Algorithm');
    body('To compute true ground acreage from GPS coordinates drawn by the farmer on an interactive Leaflet/OSM map, standard Cartesian geometry introduces intolerable distortions due to the Earth\'s curvature. AgroCloud AI implements the Spherical Shoelace algorithm on the WGS-84 authalic sphere (radius R = 6,371,007 meters).');
    body('Area (sq meters) = (R^2 / 2) * |Sum (lambda_{i+1} - lambda_i) * (2 + sin phi_i + sin phi_{i+1})|');
    body('Ground Acreage = Area (sq meters) / 4046.8564224');
    section('4.2 Mandi Freight & Realized Revenue Model');
    body('Net Realized Price per Quintal = (Gross APMC Revenue - (Freight Cost + Hamali Labor + 1.5% APMC Cess + Weighbridge Fee)) / Total Quintals');

    chapter('CHAPTER 5: SYSTEM ARCHITECTURE & DATABASE DESIGN');
    section('5.1 Multi-Tier Cloud Architecture');
    body('AgroCloud AI employs a modern 3-tier cloud architecture:');
    pdfBullet('Tier 1: Next.js 14 App Router presentation layer with Tailwind CSS, Recharts, and 12-language i18n engine.');
    pdfBullet('Tier 2: TypeScript computation service layer managing geospatial mathematics, satellite spectral processing, and agronomic rule evaluation.');
    pdfBullet('Tier 3: Supabase PostgreSQL 15 database featuring 30 relational tables, RLS tenant isolation, and private storage buckets.');
    section('5.2 PostgreSQL 30-Table Relational Schema');
    body('The database encompasses 30 tables covering user profiles, preferences, farms, fields, crops, farming activities, expenses, IoT sensors, telemetry readings, monitoring alerts, AI conversations, crop diagnoses, APMC mandi records, transport calculations, farm geometries, satellite observations, drone surveys, and simulation scenarios.');

    chapter('CHAPTER 6: IMPLEMENTATION DETAILS');
    section('6.1 Modern Full-Stack Stack');
    body('The platform is built with Next.js 14, TypeScript 5.7, Tailwind CSS, PostgreSQL, and Supabase. Over 120 standardized translation keys are localized across 12 Indian languages.');
    section('6.2 Core Functional Modules');
    body('Implemented 14 distinct modules including Executive Dashboard, Farm & Crop Management, Virtual IoT Telemetry, Weather & Evapotranspiration Advisories, AI Agronomist, Crop Doctor Leaf Pathology, Mandi Intelligence, Digital Farm Twin, Sentinel-2 Satellite Analytics, Drone Survey Analytics, What-If Farm Simulator, and Cadastral Parcel Mapping.');

    chapter('CHAPTER 7: RESULTS AND PERFORMANCE EVALUATION');
    section('7.1 Automated Testing Results');
    body('The platform achieved 100% test pass rate across 141 integration tests in scripts/test-phase7.mjs:');
    pdfBullet('Suite 1: 12-Language Localization Integrity: 96/96 Passed');
    pdfBullet('Suite 2: Satellite Spectral Remote Sensing Mathematics: 4/4 Passed');
    pdfBullet('Suite 3: Geospatial Geodesic Area Calculation: 2/2 Passed');
    pdfBullet('Suite 4: Mandi Logistics & Realized Pricing Engine: 3/3 Passed');
    pdfBullet('Suite 5: What-If Farm Agronomic Simulator: 2/2 Passed');
    pdfBullet('Suite 6: Drone Survey Upload & Size Validation: 3/3 Passed');
    pdfBullet('Suite 7: Supabase Master Database Schema Verification: 26/26 Passed');
    pdfBullet('Suite 8: Security & Secret Leak Prevention: 5/5 Passed');
    body('TypeScript Type Check: Exited with code 0 and ZERO errors.');

    chapter('CHAPTER 8: CONCLUSION AND FUTURE SCOPE');
    section('8.1 Summary of Achievements');
    body('AgroCloud AI demonstrates that cloud-native architectures, satellite remote sensing, and localized decision intelligence can be effectively unified into an accessible, low-bandwidth web platform that empowers Indian farmers with data-driven autonomy.');
    section('8.2 Future Scope');
    pdfBullet('Edge Drone Real-Time Video Streaming over WebRTC.');
    pdfBullet('Offline Progressive Web App (PWA) with IndexedDB client caching.');
    pdfBullet('Blockchain supply chain traceability for organic crop exports.');

    chapter('REFERENCES & APPENDIX');
    pdfBullet('[1] Allen, R. G. et al. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO Irrigation and Drainage Paper 56.');
    pdfBullet('[2] Rouse, J. W. et al. (1974). Monitoring vegetation systems in the Great Plains with ERTS. NASA Special Publication, 351, 309.');
    pdfBullet('[3] Huete, A. et al. (2002). Overview of the radiometric and biophysical performance of the MODIS vegetation indices. Remote Sensing of Env., 83(1-2), 195-213.');
    pdfBullet('[4] ICAR. (2024). Handbook of Agriculture: Facts and Figures for Farmers, Students and All Interested in Farming.');
    pdfBullet('[5] Directorate of Marketing & Inspection (DMI). (2026). AGMARKNET Portal, Ministry of Agriculture & Farmers Welfare.');
    doc.moveDown(1);
    section('Appendix');
    body('Complete source code, schema migrations, and documentation files are maintained in the project repository root.');

    doc.end();
    writeStream.on('finish', () => {
      console.log('Successfully written: AgroCloud_AI_Final_Project_Report.pdf');
      resolve();
    });
    writeStream.on('error', reject);
  });
}

async function main() {
  await generateDocx();
  await generatePdf();
  console.log('All academic reports successfully generated!');
}

main().catch(err => {
  console.error('Error generating reports:', err);
  process.exit(1);
});

