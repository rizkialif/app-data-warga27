import { NextResponse } from 'next/server'
import * as ketuaRtService from '@/services/ketuaRt.shared'
import { hasPermission } from '@/utils/permission'

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:rt')) {
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

    await ketuaRtService.deleteKetuaRt(id)
    return NextResponse.json({
      message: 'Ketua RT deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete Ketua RT', error: error.message },
      { status: 500 }
    )
  }
}
