import { NextRequest, NextResponse } from 'next/server';
import { aiProvider } from '@/lib/services/aiProviderService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', cropName, location } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'An image (base64) is required for foliar diagnostic analysis.' },
        { status: 400 }
      );
    }

    // Size limit verification (~10MB max base64)
    if (imageBase64.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image file size exceeds the 10MB limit. Please compress or resize the photograph.' },
        { status: 413 }
      );
    }

    const isConfigured = aiProvider.isConfigured();
    const diagnosis = await aiProvider.analyzeCropImage(imageBase64, mimeType, cropName, location);

    return NextResponse.json({
      success: true,
      diagnosis,
      isConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/ai/diagnose error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Foliar diagnostic analysis failed.',
        isConfigured: aiProvider.isConfigured(),
      },
      { status: 500 }
    );
  }
}

