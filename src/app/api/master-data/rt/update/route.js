import { NextResponse } from 'next/server'
import * as rtService from '@/services/rt.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update RT' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'RT ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const rt = await rtService.updateRt(id, body)
    return NextResponse.json({
      message: 'RT updated successfully',
      data: rt
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update RT', error: error.message },
      { status: 500 }
    )
  }
}
