import { NextResponse } from 'next/server'
import * as permissionsService from '@/services/permissions.shared'

export async function DELETE(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can delete permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    }

    await permissionsService.deletePermission(code)
    
    return NextResponse.json({
      message: 'Permission deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete permission' },
      { status: 500 }
    )
  }
}
