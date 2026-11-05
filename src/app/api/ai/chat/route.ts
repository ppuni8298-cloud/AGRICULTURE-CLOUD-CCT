import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/services/aiProviderService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = 'en', farmContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "messages" array is required.' },
        { status: 400 }
      );
    }

    const isConfigured = aiProvider.isConfigured();
    const response = await aiProvider.generateChatResponse(messages, language, farmContext);

    return NextResponse.json({
      success: true,
      content: response.content,
      provider: response.provider,
      isConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process AI chat query.',
        isConfigured: aiProvider.isConfigured(),
      },
      { status: 500 }
    );
  }
}

