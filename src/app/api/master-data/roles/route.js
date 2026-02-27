import { NextResponse } from 'next/server'
import * as rolesService from '@/services/roles.shared'

export async function GET(request) {
  try {
    const roles = await rolesService.getAllRoles()
    return NextResponse.json({
      message: 'Roles retrieved successfully',
      data: roles
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve roles' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can create roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const role = await rolesService.createRole(body)
    return NextResponse.json(
      { message: 'Role created successfully', data: role },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create role', error: error.message },
      { status: 500 }
    )
  }
}
