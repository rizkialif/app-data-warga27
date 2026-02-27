import { NextResponse } from 'next/server'
import * as permissionsService from '@/services/permissions.shared'

export async function GET(request) {
  try {
    const permissions = await permissionsService.getAllPermissions()
    return NextResponse.json({
      message: 'Permissions retrieved successfully',
      data: permissions
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve permissions' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can create permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const permission = await permissionsService.createPermission(body)
    return NextResponse.json(
      { message: 'Permission created successfully', data: permission },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create permission', error: error.message },
      { status: 500 }
    )
  }
}
