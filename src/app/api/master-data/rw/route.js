import { NextResponse } from 'next/server'
import * as rwService from '@/services/rw.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const rws = await rwService.getAllRw()
    return NextResponse.json({
      message: 'RW list retrieved successfully',
      data: rws
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve RW list' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:rw')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to create RW' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const rw = await rwService.createRw(body)
    return NextResponse.json(
      { message: 'RW created successfully', data: rw },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create RW', error: error.message },
      { status: 500 }
    )
  }
}
