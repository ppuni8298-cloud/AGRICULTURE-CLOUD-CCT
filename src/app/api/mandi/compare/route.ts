import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commodity = 'Tomato', markets = [] } = body;

    const result = marketDataService.compareMandis(commodity, markets);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/mandi/compare error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to compare mandi prices.',
      },
      { status: 500 }
    );
  }
}

