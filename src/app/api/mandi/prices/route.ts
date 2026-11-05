import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get('commodity') || undefined;
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const market = searchParams.get('market') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await marketDataService.getMandiRecords({
      commodity,
      state,
      district,
      market,
      search,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('API /api/mandi/prices error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve APMC mandi prices.',
      },
      { status: 500 }
    );
  }
}

