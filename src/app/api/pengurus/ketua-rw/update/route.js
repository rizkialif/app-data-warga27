import { NextResponse } from 'next/server'
import * as ketuaRwService from '@/services/ketuaRw.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:rw')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Ketua RW ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const ketuaRw = await ketuaRwService.updateKetuaRw(id, body)
    return NextResponse.json({
      message: 'Ketua RW updated successfully',
      data: ketuaRw
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update Ketua RW', error: error.message },
      { status: 500 }
    )
  }
}
