import { NextResponse } from 'next/server'
import * as ketuaRwService from '@/services/ketuaRw.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const ketuaRws = await ketuaRwService.getAllKetuaRw()
    return NextResponse.json({
      message: 'Ketua RW list retrieved successfully',
      data: ketuaRws
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve Ketua RW list' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:rw')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const ketuaRw = await ketuaRwService.createKetuaRw(body)
    return NextResponse.json(
      { message: 'Ketua RW created successfully', data: ketuaRw },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create Ketua RW', error: error.message },
      { status: 500 }
    )
  }
}
