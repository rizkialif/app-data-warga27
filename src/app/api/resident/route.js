import { NextResponse } from 'next/server'
import * as residentService from '@/services/resident.shared'
import { hasPermission } from '@/utils/permission'

export async function GET() {
  try {
    const residents = await residentService.getAllResidents()
    return NextResponse.json({
      message: 'Residents retrieved successfully',
      data: residents
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve residents' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:warga')) {
      return NextResponse.json(
        { message: `Forbidden: You do not have permission to create resident data.` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const resident = await residentService.createResident(body)
    return NextResponse.json(
      { message: 'Resident created successfully', data: resident },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create resident' },
      { status: 500 }
    )
  }
}
