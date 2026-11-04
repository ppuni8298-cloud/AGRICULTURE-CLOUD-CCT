export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳', greeting: 'Welcome to AgroCloud AI' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🌾', greeting: 'ಅಗ್ರೋಕ್ಲೌಡ್ ಎಐ ಗೆ ಸುಸ್ವಾಗತ' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', greeting: 'एग्रोक्लाउड एआई में आपका स्वागत है' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🌾', greeting: 'అగ్రోక్లౌడ్ AI కి స్వాగతం' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🌾', greeting: 'அக்ரோகிளவுட் AI-க்கு நல்வரவு' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🌾', greeting: 'അഗ്രോക്ലൗഡ് എഐയിലേക്ക് സ്വാഗതം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🌾', greeting: 'ॲग्रोक्लाउड एआय मध्ये आपले स्वागत आहे' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🌾', greeting: 'એગ્રોક્લાઉડ એઆઈ માં આપનું સ્વાગત છે' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🌾', greeting: 'অ্যাগ্রোক্লাউড এআই-তে স্বাগতম' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🌾', greeting: 'ਐਗਰੋਕਲਾਉਡ ਏਆਈ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🌾', greeting: 'ଆଗ୍ରୋକ୍ଲାଉଡ୍ AI କୁ ସ୍ୱାଗତ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🌾', greeting: 'এগ্ৰ’ক্লাউড এআইলৈ স্বাগতম' },
];

export const DEFAULT_LANGUAGE = 'en';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

