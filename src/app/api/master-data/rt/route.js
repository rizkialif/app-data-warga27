import { NextResponse } from 'next/server'
import * as rtService from '@/services/rt.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const rts = await rtService.getAllRt()
    return NextResponse.json({
      message: 'RT list retrieved successfully',
      data: rts
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve RT list' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to create RT' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const rt = await rtService.createRt(body)
    return NextResponse.json(
      { message: 'RT created successfully', data: rt },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create RT', error: error.message },
      { status: 500 }
    )
  }
}
