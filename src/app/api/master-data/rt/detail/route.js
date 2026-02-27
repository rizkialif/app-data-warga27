import { NextResponse } from 'next/server'
import * as rtService from '@/services/rt.shared'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'RT ID is required' }, { status: 400 })
    }

    const rt = await rtService.getRtById(id)
    return NextResponse.json({
      message: 'RT details retrieved successfully',
      data: rt
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve RT detail' },
      { status: error.message === 'RT not found' ? 404 : 500 }
    )
  }
}
