import { NextResponse } from 'next/server'
import * as statsService from '@/services/stats.shared'

export async function GET() {
  try {
    const stats = await statsService.getDashboardSummary()
    return NextResponse.json({
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve dashboard statistics' },
      { status: 500 }
    )
  }
}
