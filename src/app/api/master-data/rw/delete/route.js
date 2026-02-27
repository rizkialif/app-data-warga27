import { NextResponse } from 'next/server'
import * as rwService from '@/services/rw.shared'
import { hasPermission } from '@/utils/permission'

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:rw')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete RW' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    await rwService.deleteRw(id)
    
    return NextResponse.json({
      message: 'RW deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete RW' },
      { status: 500 }
    )
  }
}
