import { NextResponse } from 'next/server'
import * as ketuaRtService from '@/services/ketuaRt.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Ketua RT ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const ketuaRt = await ketuaRtService.updateKetuaRt(id, body)
    return NextResponse.json({
      message: 'Ketua RT updated successfully',
      data: ketuaRt
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update Ketua RT', error: error.message },
      { status: 500 }
    )
  }
}
