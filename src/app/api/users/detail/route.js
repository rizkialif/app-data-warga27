import { NextResponse } from 'next/server'
import * as userService from '@/services/user.service'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const user = await userService.getUserById(id)
    return NextResponse.json({
      message: 'User retrieved successfully',
      data: user
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve user' },
      { status: 500 }
    )
  }
}

// UNIQUE_DEBUG_ID: 998877665544332211
export async function PUT(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')
    console.log('[DEBUG] API Update User - x-user-role:', userRole, 'x-user-id:', userId);

    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          message: `Forbidden: Only admin can update users. (Detected Role: ${userRole})`,
          debug: { userRole, userId }
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const user = await userService.updateUser(id, body)
    
    return NextResponse.json({
      message: 'User updated successfully',
      data: user
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin can delete users' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    await userService.deleteUser(id)
    
    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
