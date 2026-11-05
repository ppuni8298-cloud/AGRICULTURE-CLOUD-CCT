import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  AIConversation,
  AIMessage,
  CropDiagnosis,
  CropRecommendation,
  YieldPrediction,
  AIFarmInsight,
} from '@/lib/supabase/types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'agrocloud_ai_conversations',
  MESSAGES: 'agrocloud_ai_messages',
  DIAGNOSES: 'agrocloud_crop_diagnoses',
  RECOMMENDATIONS: 'agrocloud_crop_recommendations',
  PREDICTIONS: 'agrocloud_yield_predictions',
  INSIGHTS: 'agrocloud_ai_farm_insights',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

// Initial Seed Conversations
const SEED_CONVERSATIONS: AIConversation[] = [
  {
    id: 'conv-001',
    user_id: 'demo-farmer-001',
    title: 'Tomato Foliar Leaf Blight Advisory',
    language: 'en',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'conv-002',
    user_id: 'demo-farmer-001',
    title: 'ಮುಸುಕಿನ ಜೋಳ (Maize) ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ',
    language: 'kn',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];

const SEED_MESSAGES: AIMessage[] = [
  {
    id: 'msg-001',
    conversation_id: 'conv-001',
    user_id: 'demo-farmer-001',
    role: 'user',
    content: 'My tomato crop in Block A is showing brown concentric target spots on lower foliage. What should I do?',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-002',
    conversation_id: 'conv-001',
    user_id: 'demo-farmer-001',
    role: 'assistant',
    content: `Based on your tomato crop description in Block A (Red Sandy Loam, currently in Vegetative growth stage):\n\nSymptoms indicate Early Blight (Alternaria solani).\n\nImmediate Recommendations:\n1. Cultural: Prune infected lower 2-3 leaf nodes to prevent spore splash.\n2. Chemical: Foliar spray with Mancozeb 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L of clean water.\n3. Weather Notice: Your Kolar forecast indicates calm winds (< 10 km/h) tomorrow morning between 06:30 and 09:30 AM, providing an optimal spray window.\n4. KVK Consultation: If lesions appear on green fruits, contact Kolar KVK.`,
    data_context: { crop: 'Tomato', field: 'Block A', soilMoisture: 42.5 },
    is_voice: false,
    created_at: new Date(Date.now() - 2 * 3600 * 1000 + 5000).toISOString(),
  },
  {
    id: 'msg-003',
    conversation_id: 'conv-002',
    user_id: 'demo-farmer-001',
    role: 'user',
    content: 'ಮುಸುಕಿನ ಜೋಳಕ್ಕೆ ಎರಡನೇ ಬಾರಿ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಯಾವಾಗ ಹಾಕಬೇಕು?',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-004',
    conversation_id: 'conv-002',
    user_id: 'demo-farmer-001',
    role: 'assistant',
    content: `ಮುಸುಕಿನ ಜೋಳ ಬಿತ್ತನೆ ಮಾಡಿದ 30 ರಿಂದ 35 ದಿನಗಳ ನಂತರ (ಮೊಳಕೆ ಹಂತದಲ್ಲಿ) ಎರಡನೇ ಕಂತಿನ ಸಾರಜನಕವನ್ನು (ಯೂರಿಯಾ) ಹೆಕ್ಟೇರಿಗೆ 50 ಕೆಜಿ ಪ್ರಮಾಣದಲ್ಲಿ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಬೇಕು.\n\nಗಮನಿಸಬೇಕಾದ ಅಂಶಗಳು:\n- ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶವಿರಬೇಕು (ತೇವಾಂಶ 40% ಗಿಂತ ಹೆಚ್ಚಿರಬೇಕು).\n- ಗೊಬ್ಬರ ಹಾಕಿದ ನಂತರ ತಕ್ಷಣ ಸಾಲುಗಳ ನಡುವೆ ಮಣ್ಣು ಏರಿಸಿ, ನೀರು ಹಾಯಿಸಿ.\n- ಸೈನಿಕ ಹುಳು (Fall Armyworm) ಬಾಧೆ ಕಂಡುಬಂದರೆ ಸುಳಿಯಲ್ಲಿ ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.`,
    is_voice: false,
    created_at: new Date(Date.now() - 20 * 3600 * 1000 + 4000).toISOString(),
  },
];

// Initial Seed Diagnoses
const SEED_DIAGNOSES: CropDiagnosis[] = [
  {
    id: 'diag-001',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_name: 'Tomato (Solanum lycopersicum)',
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400&auto=format&fit=crop&q=80',
    disease_name: 'Early Blight (Target Spot)',
    scientific_name: 'Alternaria solani',
    severity: 'moderate',
    confidence: 93.4,
    visible_symptoms: [
      'Concentric brown to black target-board rings on mature lower leaves.',
      'Surrounding chlorotic yellow halo encircling each lesion.',
      'Premature senescence and leaf drop starting from the bottom of the plant upwards.',
    ],
    possible_causes: [
      'High relative humidity (>80%) accompanied by warm canopy temperatures (24–29°C).',
      'Overhead irrigation causing soil splash onto lower foliage.',
      'Spore carryover on volunteer solanaceous weeds or un-degraded crop residue.',
    ],
    suggested_steps: [
      'Prune lower 2-3 leaf nodes with clean shears; dispose of pruned leaves outside the plot boundary.',
      'Spray Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L or Difenoconazole 25% EC @ 0.5ml/L.',
      'Transition to drip irrigation to keep leaf surfaces dry.',
    ],
    prevention_guidance: [
      'Practice a 3-year crop rotation with non-solanaceous crops such as maize or pulses.',
      'Apply silver-black reflective plastic mulch to create a physical barrier preventing fungal spores from splashing onto foliage.',
    ],
    is_confirmed_diagnosis: false,
    disclaimer:
      'Preliminary AI assessment based on visual patterns. Consult your local Krishi Vigyan Kendra (KVK) or an ICAR-certified agronomist before applying chemical treatments.',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

export const aiFarmService = {
  // ============================================================================
  // AI CONVERSATIONS & CHAT HISTORY
  // ============================================================================
  async getConversations(userId?: string): Promise<AIConversation[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('ai_conversations')
          .select('*')
          .order('updated_at', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as AIConversation[];
        if (error && error.code !== 'PGRST205') {
          console.warn('[Supabase getConversations Notice]:', error.message);
        }
      }
    }

    const all = getLocalItem<AIConversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
    if (!userId) return all;
    return all.filter((c) => c.user_id === userId || c.user_id === 'demo-farmer-001');
  },

  async createConversation(title: string, language: string = 'en', userId: string): Promise<AIConversation> {
    const newConv: AIConversation = {
      id: `conv-${Date.now()}`,
      user_id: userId,
      title,
      language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('ai_conversations')
          .insert([{ title, language, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as AIConversation;
      }
    }

    const all = getLocalItem<AIConversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
    const updated = [newConv, ...all];
    setLocalItem(STORAGE_KEYS.CONVERSATIONS, updated);
    return newConv;
  },

  async deleteConversation(conversationId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('ai_conversations').delete().eq('id', conversationId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (!error) return true;
      }
    }

    const convs = getLocalItem<AIConversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS).filter(
      (c) => c.id !== conversationId
    );
    const msgs = getLocalItem<AIMessage[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES).filter(
      (m) => m.conversation_id !== conversationId
    );
    setLocalItem(STORAGE_KEYS.CONVERSATIONS, convs);
    setLocalItem(STORAGE_KEYS.MESSAGES, msgs);
    return true;
  },

  async getMessages(conversationId: string, userId?: string): Promise<AIMessage[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('ai_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as AIMessage[];
      }
    }

    const all = getLocalItem<AIMessage[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    return all.filter((m) => m.conversation_id === conversationId);
  },

  async saveMessage(
    messageData: Omit<AIMessage, 'id' | 'created_at'>,
    userId: string
  ): Promise<AIMessage> {
    const newMsg: AIMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('ai_messages')
          .insert([{ ...messageData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as AIMessage;
      }
    }

    const all = getLocalItem<AIMessage[]>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    const updated = [...all, newMsg];
    setLocalItem(STORAGE_KEYS.MESSAGES, updated);

    // Also update conversation timestamp
    const convs = getLocalItem<AIConversation[]>(STORAGE_KEYS.CONVERSATIONS, SEED_CONVERSATIONS);
    const cIdx = convs.findIndex((c) => c.id === messageData.conversation_id);
    if (cIdx !== -1) {
      convs[cIdx].updated_at = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    return newMsg;
  },

  // ============================================================================
  // CROP DOCTOR DIAGNOSES
  // ============================================================================
  async getDiagnoses(userId?: string): Promise<CropDiagnosis[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('crop_diagnoses')
          .select('*')
          .order('created_at', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as CropDiagnosis[];
      }
    }

    const all = getLocalItem<CropDiagnosis[]>(STORAGE_KEYS.DIAGNOSES, SEED_DIAGNOSES);
    if (!userId) return all;
    return all.filter((d) => d.user_id === userId || d.user_id === 'demo-farmer-001');
  },

  async saveDiagnosis(
    diagnosisData: Omit<CropDiagnosis, 'id' | 'created_at'>,
    userId: string
  ): Promise<CropDiagnosis> {
    const newDiag: CropDiagnosis = {
      ...diagnosisData,
      id: `diag-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('crop_diagnoses')
          .insert([{ ...diagnosisData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as CropDiagnosis;
      }
    }

    const all = getLocalItem<CropDiagnosis[]>(STORAGE_KEYS.DIAGNOSES, SEED_DIAGNOSES);
    const updated = [newDiag, ...all];
    setLocalItem(STORAGE_KEYS.DIAGNOSES, updated);
    return newDiag;
  },

  // ============================================================================
  // SMART CROP RECOMMENDATIONS
  // ============================================================================
  async getRecommendations(userId?: string): Promise<CropRecommendation[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('crop_recommendations')
          .select('*')
          .order('created_at', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as CropRecommendation[];
      }
    }

    const all = getLocalItem<CropRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, []);
    if (!userId) return all;
    return all.filter((r) => r.user_id === userId || r.user_id === 'demo-farmer-001');
  },

  async saveRecommendation(
    recData: Omit<CropRecommendation, 'id' | 'created_at'>,
    userId: string
  ): Promise<CropRecommendation> {
    const newRec: CropRecommendation = {
      ...recData,
      id: `rec-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('crop_recommendations')
          .insert([{ ...recData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as CropRecommendation;
      }
    }

    const all = getLocalItem<CropRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, []);
    const updated = [newRec, ...all];
    setLocalItem(STORAGE_KEYS.RECOMMENDATIONS, updated);
    return newRec;
  },

  // ============================================================================
  // YIELD PREDICTIONS
  // ============================================================================
  async getPredictions(userId?: string): Promise<YieldPrediction[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('yield_predictions')
          .select('*')
          .order('created_at', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as YieldPrediction[];
      }
    }

    const all = getLocalItem<YieldPrediction[]>(STORAGE_KEYS.PREDICTIONS, []);
    if (!userId) return all;
    return all.filter((p) => p.user_id === userId || p.user_id === 'demo-farmer-001');
  },

  async getYieldPredictions(userId?: string): Promise<YieldPrediction[]> {
    return this.getPredictions(userId);
  },

  async savePrediction(
    predData: Omit<YieldPrediction, 'id' | 'created_at'>,
    userId: string
  ): Promise<YieldPrediction> {
    const newPred: YieldPrediction = {
      ...predData,
      id: `pred-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('yield_predictions')
          .insert([{ ...predData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as YieldPrediction;
      }
    }

    const all = getLocalItem<YieldPrediction[]>(STORAGE_KEYS.PREDICTIONS, []);
    const updated = [newPred, ...all];
    setLocalItem(STORAGE_KEYS.PREDICTIONS, updated);
    return newPred;
  },

  async saveYieldPrediction(
    predData: Omit<YieldPrediction, 'id' | 'created_at'>,
    userId: string
  ): Promise<YieldPrediction> {
    return this.savePrediction(predData, userId);
  },

  // ============================================================================
  // AI FARM INSIGHTS
  // ============================================================================
  async getInsights(userId?: string): Promise<AIFarmInsight[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('ai_farm_insights')
          .select('*')
          .order('created_at', { ascending: false });
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as AIFarmInsight[];
      }
    }

    const all = getLocalItem<AIFarmInsight[]>(STORAGE_KEYS.INSIGHTS, []);
    if (!userId) return all;
    return all.filter((i) => i.user_id === userId || i.user_id === 'demo-farmer-001');
  },

  async dismissInsight(insightId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('ai_farm_insights').delete().eq('id', insightId);
        if (userId) q = q.eq('user_id', userId);
        await q;
      }
    }
    const all = getLocalItem<AIFarmInsight[]>(STORAGE_KEYS.INSIGHTS, []);
    setLocalItem(
      STORAGE_KEYS.INSIGHTS,
      all.filter((i) => i.id !== insightId)
    );
    return true;
  },

  async saveInsightsBatch(
    insights: Array<Omit<AIFarmInsight, 'id' | 'user_id' | 'created_at'>>,
    userId: string
  ): Promise<AIFarmInsight[]> {
    const newItems: AIFarmInsight[] = insights.map((item, idx) => ({
      ...item,
      id: `insight-${Date.now()}-${idx}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('ai_farm_insights')
          .insert(newItems.map((i) => ({ ...i, user_id: userId })))
          .select();
        if (!error && data) return data as AIFarmInsight[];
      }
    }

    const all = getLocalItem<AIFarmInsight[]>(STORAGE_KEYS.INSIGHTS, []);
    // Prepend fresh insights
    const updated = [...newItems, ...all].slice(0, 50);
    setLocalItem(STORAGE_KEYS.INSIGHTS, updated);
    return newItems;
  },
};

