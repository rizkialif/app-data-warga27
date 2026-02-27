import { NextResponse } from 'next/server'
import * as rtService from '@/services/rt.shared'
import { hasPermission } from '@/utils/permission'

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:rt')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete RT' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'RT ID is required' }, { status: 400 })
    }

    await rtService.deleteRt(id)
    return NextResponse.json({ message: 'RT deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete RT', error: error.message },
      { status: 500 }
    )
  }
}
