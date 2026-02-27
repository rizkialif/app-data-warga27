import { NextResponse } from 'next/server'
import * as rolesService from '@/services/roles.shared'

export async function PUT(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can update roles' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    }

    const body = await request.json()
    const role = await rolesService.updateRole(code, body)
    
    return NextResponse.json({
      message: 'Role updated successfully',
      data: role
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}
