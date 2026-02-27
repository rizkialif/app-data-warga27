import { NextResponse } from 'next/server'
import * as rwService from '@/services/rw.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:rw')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update RW' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const rw = await rwService.updateRw(id, body)
    
    return NextResponse.json({
      message: 'RW updated successfully',
      data: rw
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update RW' },
      { status: 500 }
    )
  }
}
