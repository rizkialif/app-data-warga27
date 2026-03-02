import { NextResponse } from 'next/server'
import * as ketuaRtService from '@/services/ketuaRt.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const ketuaRts = await ketuaRtService.getAllKetuaRt()
    return NextResponse.json({
      message: 'Ketua RT list retrieved successfully',
      data: ketuaRts
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve Ketua RT list' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const ketuaRt = await ketuaRtService.createKetuaRt(body)
    return NextResponse.json(
      { message: 'Ketua RT created successfully', data: ketuaRt },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create Ketua RT', error: error.message },
      { status: 500 }
    )
  }
}
