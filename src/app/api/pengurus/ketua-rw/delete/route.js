import { NextResponse } from 'next/server'
import * as ketuaRwService from '@/services/ketuaRw.shared'
import { hasPermission } from '@/utils/permission'

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:rw')) {
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

    await ketuaRwService.deleteKetuaRw(id)
    return NextResponse.json({
      message: 'Ketua RW deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete Ketua RW', error: error.message },
      { status: 500 }
    )
  }
}
