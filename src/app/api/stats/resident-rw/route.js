import { NextResponse } from 'next/server'
import * as statsService from '@/services/stats.shared'

export async function GET() {
  try {
    const stats = await statsService.getResidentStatsByRw()
    return NextResponse.json({
      message: 'Statistics retrieved successfully',
      data: stats
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve statistics' },
      { status: 500 }
    )
  }
}
