import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get('commodity') || 'Tomato';
    const market = searchParams.get('market') || undefined;
    const days = parseInt(searchParams.get('days') || '30', 10);

    const analytics = marketDataService.getHistoricalAnalytics(commodity, market, days);

    return NextResponse.json({
      success: true,
      ...analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/mandi/analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch historical market analytics.',
      },
      { status: 500 }
    );
  }
}

