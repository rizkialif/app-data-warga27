import { NextResponse } from 'next/server'
import * as userService from '@/services/user.service'

export async function GET() {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json({
      message: 'Users retrieved successfully',
      data: users
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve users' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: `Forbidden: Only admin can create users. (Your role: ${userRole})` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const user = await userService.createUser(body)
    return NextResponse.json(
      { message: 'User created successfully', data: user },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
