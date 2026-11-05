import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get('commodity') || 'Tomato';
    const market = searchParams.get('market') || 'Kolar APMC Yard';

    const advisory = marketDataService.generateSellingAdvisory(commodity, market);

    return NextResponse.json({
      success: true,
      advisory,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/mandi/advisor error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate farmer selling advisory.',
      },
      { status: 500 }
    );
  }
}

