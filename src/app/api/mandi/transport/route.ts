import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      commodity = 'Tomato',
      quantityQuintals = 20,
      destinationMarket = 'Kolar APMC Yard',
      distanceKm = 35,
      vehicleType = 'pickup',
      customModalPrice,
    } = body;

    const result = marketDataService.calculateTransport({
      commodity,
      quantityQuintals: parseFloat(quantityQuintals) || 20,
      destinationMarket,
      distanceKm: parseFloat(distanceKm) || 35,
      vehicleType,
      customModalPrice: customModalPrice ? parseFloat(customModalPrice) : undefined,
    });

    return NextResponse.json({
      success: true,
      calculation: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/mandi/transport error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate transportation economics.',
      },
      { status: 500 }
    );
  }
}

