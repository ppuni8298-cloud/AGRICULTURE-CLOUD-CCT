'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { aiFarmService } from '@/lib/services/aiFarmService';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import type { AIConversation, AIMessage, Farm, Field, Crop, IoTSensor } from '@/lib/supabase/types';
import {
  Bot,
  User,
  Send,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  MapPin,
  Wheat,
  Activity,
  Layers,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Info,
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Language codes to BCP-47 for Web Speech STT and TTS
const BCP47_LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
};

const SUGGESTED_QUERIES = [
  {
    category: 'Crop Health',
    text: 'My tomato leaves are curling with brown concentric rings. What organic or ICAR spray should I apply?',
  },
  {
    category: 'Smart Irrigation',
    text: 'What is the recommended drip irrigation interval for flowering maize in red sandy loam soil?',
  },
  {
    category: 'Weather Risk',
    text: 'Can I spray fungicide if high humidity and light drizzle are predicted over the next 36 hours?',
  },
  {
    category: 'Mandi Timing',
    text: 'How should I grade and cure harvested red onions to minimize rot during APMC transit?',
  },
];

export default function AiAssistantPage() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { user, profile } = useAuth();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // Conversations & Messages State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerBadge, setProviderBadge] = useState<string>('ICAR Agronomic Intelligence');

  // Farm Context State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropName, setSelectedCropName] = useState<string>('');
  const [latestMoisture, setLatestMoisture] = useState<number | null>(42.5);
  const [includeFarmContext, setIncludeFarmContext] = useState<boolean>(true);

  // Multilingual Voice (Speech-to-Text & Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load User Farms and Crops for Context Integration
  useEffect(() => {
    async function loadFarmContext() {
      try {
        const userFarms = await farmService.getFarms(userId);
        setFarms(userFarms);
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0].id);
          const farmCrops = await farmService.getCrops(userFarms[0].id, userId);
          setCrops(farmCrops);
          if (farmCrops.length > 0) {
            setSelectedCropName(farmCrops[0].name);
          }
          // Try loading latest moisture reading
          try {
            const readings = await iotService.getReadings({
              farmId: userFarms[0].id,
              parameter: 'soil_moisture',
              limit: 1,
              userId,
            });
            if (readings.length > 0) {
              setLatestMoisture(readings[0].value);
            }
          } catch {
            // Keep default fallback
          }
        }
      } catch (err) {
        console.warn('Failed to load farm context for AI assistant:', err);
      }
    }
    loadFarmContext();
  }, [userId]);

  // Update crops when farm selection changes
  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) {
      setCrops([]);
      setSelectedCropName('');
      return;
    }
    try {
      const farmCrops = await farmService.getCrops(farmId, userId);
      setCrops(farmCrops);
      if (farmCrops.length > 0) {
        setSelectedCropName(farmCrops[0].name);
      } else {
        setSelectedCropName('');
      }
    } catch (err) {
      console.warn('Failed to load crops for farm:', err);
    }
  };

  // Load Conversations List
  const loadConversations = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const convs = await aiFarmService.getConversations(userId);
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
        const msgs = await aiFarmService.getMessages(convs[0].id, userId);
        setMessages(msgs);
      } else {
        // Create initial default conversation
        const initial = await aiFarmService.createConversation(
          'General Farm Advisory Consultation',
          language,
          userId
        );
        setConversations([initial]);
        setActiveConversationId(initial.id);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [userId, language]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Switch Conversation
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setErrorMessage(null);
    try {
      const msgs = await aiFarmService.getMessages(convId, userId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  // Create New Conversation
  const handleCreateNewConversation = async () => {
    try {
      const newTitle = `Advisory Chat ${new Date().toLocaleDateString()}`;
      const newConv = await aiFarmService.createConversation(newTitle, language, userId);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this consultation conversation?')) return;
    try {
      await aiFarmService.deleteConversation(convId, userId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Web Speech API: Speech-to-Text (Voice Input)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = BCP47_LANGUAGE_MAP[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setSpeechError('Failed to start microphone voice input.');
      setIsListening(false);
    }
  };

  // Text-to-Speech (Audio Playback of Assistant Response)
  const handleSpeakText = (messageId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-Speech audio is not supported in this browser.');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP47_LANGUAGE_MAP[language] || 'en-IN';
    utterance.rate = 0.95;

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(language) || v.lang === BCP47_LANGUAGE_MAP[language]
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Send Farmer Message
  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQuery || inputQuery;
    if (!queryToSend.trim()) return;

    let convId = activeConversationId;
    if (!convId) {
      const newConv = await aiFarmService.createConversation(
        queryToSend.substring(0, 30) + '...',
        language,
        userId
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      convId = newConv.id;
    }

    // Build user message
    const userMsgData: Omit<AIMessage, 'id' | 'created_at'> = {
      conversation_id: convId,
      user_id: userId,
      role: 'user',
      content: queryToSend.trim(),
      is_voice: isListening,
    };

    const savedUserMsg = await aiFarmService.saveMessage(userMsgData, userId);
    setMessages((prev) => [...prev, savedUserMsg]);
    setInputQuery('');
    setErrorMessage(null);
    setIsTyping(true);

    try {
      // Build farm context payload
      const selectedFarm = farms.find((f) => f.id === selectedFarmId);
      const farmContextPayload = includeFarmContext && selectedFarm
        ? {
            farmName: selectedFarm.name,
            location: `${selectedFarm.taluk || ''}, ${selectedFarm.district || ''}, ${selectedFarm.state || ''}`,
            crop: selectedCropName || 'General Mixed Cultivation',
            soilType: selectedFarm.soil_type || 'Red Sandy Loam',
            irrigationType: selectedFarm.irrigation_type || 'Drip Irrigation',
            recentSoilMoisture: latestMoisture ? `${latestMoisture}%` : undefined,
            recentWeatherSummary: 'Partly cloudy, 28°C, RH 65%',
          }
        : undefined;

      // Prepare conversation messages history for the API
      const conversationPayload = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: queryToSend.trim() },
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationPayload,
          language,
          farmContext: farmContextPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to generate agronomic response.');
      }

      setProviderBadge(
        data.provider === 'google-gemini' || data.provider === 'gemini'
          ? 'Google Gemini 1.5 Agronomy'
          : data.provider === 'openai'
          ? 'OpenAI Agronomy Engine'
          : 'AgroCloud AI Agronomy Intelligence (ICAR Expert System)'
      );

      // Save Assistant Response
      const assistantMsgData: Omit<AIMessage, 'id' | 'created_at'> = {
        conversation_id: convId,
        user_id: userId,
        role: 'assistant',
        content: data.content,
        data_context: farmContextPayload,
        is_voice: false,
      };

      const savedAssistantMsg = await aiFarmService.saveMessage(assistantMsgData, userId);
      setMessages((prev) => [...prev, savedAssistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'An error occurred while consulting the agronomic AI. Please retry.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                AgroCloud AI Farm Assistant
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Multilingual agronomic conversational intelligence powered by ICAR crop models & regional weather.
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector & Engine Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Globe2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-semibold bg-transparent text-emerald-950 dark:text-emerald-100 focus:outline-none cursor-pointer"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{providerBadge}</span>
          </div>
        </div>
      </div>

      {/* Advisory Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Agronomic Advisory Notice:</strong> AgroCloud AI recommendations follow ICAR (Indian Council of Agricultural Research) packages of practices and regional micro-climate data. Always verify high-volume chemical or foliar fungicide sprays with your nearest Krishi Vigyan Kendra (KVK) or local Agricultural Extension Officer.
        </div>
      </div>

      {/* Main Grid: Left Sidebar (History & Farm Context) + Right Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Conversations & Farm Context */}
        <div className="lg:col-span-4 space-y-4">
          {/* Farm Telemetry Context Selector Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                  Farm Telemetry Context
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 dark:text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFarmContext}
                  onChange={(e) => setIncludeFarmContext(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Active</span>
              </label>
            </div>

            {includeFarmContext ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 block mb-1">
                    Select Farm
                  </label>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => handleFarmChange(e.target.value)}
                    className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                  >
                    {farms.length === 0 ? (
                      <option value="">No registered farms found</option>
                    ) : (
                      farms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.district || f.state || 'Field'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {crops.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 block mb-1">
                      Active Crop
                    </label>
                    <select
                      value={selectedCropName}
                      onChange={(e) => setSelectedCropName(e.target.value)}
                      className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                    >
                      {crops.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.growth_stage})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18]/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Virtual Soil Moisture:
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {latestMoisture !== null ? `${latestMoisture}% (Optimal)` : '42.5%'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 dark:text-emerald-400 italic">
                Farm context disabled. AI will provide general all-India agronomic guidance.
              </p>
            )}
          </div>

          {/* Conversation History Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                Consultation History
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateNewConversation}
                className="text-xs py-1 px-2.5 h-8 gap-1 border-emerald-300 text-emerald-700 dark:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <div className="text-center py-8 text-xs text-stone-400 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading chat history...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 dark:text-emerald-400">
                  No previous conversations. Start a new consultation!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all duration-150 border flex items-center justify-between group ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
                          : 'bg-white dark:bg-[#071F18]/40 border-emerald-100/60 dark:border-emerald-800/40 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'
                          }`}
                        />
                        <div className="truncate">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isActive
                                ? 'text-emerald-950 dark:text-emerald-100'
                                : 'text-stone-700 dark:text-emerald-300'
                            }`}
                          >
                            {conv.title}
                          </p>
                          <span className="text-[10px] text-stone-400 dark:text-emerald-400/70">
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shrink-0 ml-2"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Chat Stream */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-100 dark:border-emerald-800 shadow-xl overflow-hidden flex flex-col h-[640px]">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-emerald-50/20 dark:bg-[#071F18]/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner">
                    <Bot className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                    Welcome to your AgroCloud AI Assistant
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-emerald-300/80 max-w-md">
                    Ask any agronomic question in your preferred language via voice or text. The assistant will combine ICAR packages of practices with your farm telemetry.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isPlayingThis = speakingMessageId === m.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-xl p-4 rounded-2xl ${
                          isUser
                            ? 'bg-emerald-700 text-white rounded-tr-sm shadow-md'
                            : 'bg-white dark:bg-[#0A2920] text-stone-800 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/80 rounded-tl-sm shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/20 dark:border-emerald-800/40">
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                            {isUser ? 'Farmer' : 'AgroCloud Advisory'}
                          </span>
                          <span className="text-[10px] opacity-60 font-mono">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {m.content}
                        </p>

                        {/* Farm Context Tag & Audio Button for Assistant */}
                        {!isUser && (
                          <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between gap-2 text-[10px]">
                            {m.data_context ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                                Context: {m.data_context.crop || 'Farm'} ({m.data_context.field || 'Plot'})
                              </span>
                            ) : (
                              <span className="text-stone-400 dark:text-emerald-400/60">
                                ICAR Standard Advisory
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSpeakText(m.id, m.content)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                                isPlayingThis
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                              }`}
                              title={isPlayingThis ? 'Stop Audio' : 'Listen to Audio'}
                            >
                              {isPlayingThis ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-emerald-400 pl-11">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span>Synthesizing ICAR agronomic guidance & regional micro-weather...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border-t border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="font-bold underline text-xs ml-2"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Speech-to-Text Status / Warning Banner */}
            {speechError && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-t border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span>{speechError}</span>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-stone-400 hover:text-stone-700 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {isListening && (
              <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 border-t border-emerald-300 dark:border-emerald-700 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="font-semibold">
                  Listening in {supportedLanguages.find((l) => l.code === language)?.name || 'Language'}... Speak clearly into your microphone.
                </span>
              </div>
            )}

            {/* Suggested Queries Chips */}
            <div className="p-3 bg-emerald-50/50 dark:bg-[#082218] border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
              <span className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase shrink-0">
                Quick Questions:
              </span>
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(undefined, q.text)}
                  className="px-3 py-1 rounded-xl bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-[11px] whitespace-nowrap shrink-0 transition-all font-medium"
                >
                  {q.category}: {q.text.substring(0, 32)}...
                </button>
              ))}
            </div>

            {/* Input Bar with Text + Voice Button */}
            <form
              onSubmit={(e) => handleSend(e)}
              className="p-3 sm:p-4 bg-white dark:bg-[#0A2920] border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-2 sm:gap-3"
            >
              {/* Voice Input Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all shadow-sm shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-red-600/30'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak Your Question in Selected Language'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask any agronomic question in ${
                  supportedLanguages.find((l) => l.code === language)?.name || 'your language'
                }...`}
                className="flex-1 bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!inputQuery.trim() || isTyping}
                isLoading={isTyping}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Ask AI
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
