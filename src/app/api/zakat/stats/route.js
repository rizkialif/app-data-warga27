import { NextResponse } from 'next/server';
import { getZakatDashboardStats } from '@/services/zakatStats.shared';

export async function GET() {
  try {
    const stats = await getZakatDashboardStats();
    return NextResponse.json({
      message: 'Zakat statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve zakat statistics' },
      { status: 500 }
    );
  }
}
