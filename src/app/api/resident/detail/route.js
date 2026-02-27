import { NextResponse } from 'next/server'
import * as residentService from '@/services/resident.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'Resident ID is required' }, { status: 400 })
    }

    const resident = await residentService.getResidentById(id)
    return NextResponse.json({
      message: 'Resident retrieved successfully',
      data: resident
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve resident' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:warga')) {
      return NextResponse.json(
        { message: `Forbidden: You do not have permission to update resident data.` },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'Resident ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const resident = await residentService.updateResident(id, body)
    return NextResponse.json({
      message: 'Resident updated successfully',
      data: resident
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update resident' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:warga')) {
      return NextResponse.json(
        { message: `Forbidden: You do not have permission to delete resident data.` },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ message: 'Resident ID is required' }, { status: 400 })
    }

    await residentService.deleteResident(id)
    return NextResponse.json({
      message: 'Resident deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete resident' },
      { status: 500 }
    )
  }
}
