import { NextResponse } from 'next/server'
import * as permissionsService from '@/services/permissions.shared'

export async function PUT(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can update permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    }

    const body = await request.json()
    const permission = await permissionsService.updatePermission(code, body)
    
    return NextResponse.json({
      message: 'Permission updated successfully',
      data: permission
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update permission' },
      { status: 500 }
    )
  }
}
