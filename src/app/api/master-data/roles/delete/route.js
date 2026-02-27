import { NextResponse } from 'next/server'
import * as rolesService from '@/services/roles.shared'

export async function DELETE(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can delete roles' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    }

    await rolesService.deleteRole(code)
    
    return NextResponse.json({
      message: 'Role deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete role' },
      { status: 500 }
    )
  }
}
