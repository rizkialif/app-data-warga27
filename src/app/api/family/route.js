import { NextResponse } from 'next/server'
import * as familyService from '@/services/family.shared'
import { hasPermission } from '@/utils/permission'

export async function GET() {
  try {
    const families = await familyService.getAllFamilies()
    return NextResponse.json({
      message: 'Families retrieved successfully',
      data: families
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve families' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:family')) {
      return NextResponse.json(
        { message: `Forbidden: You do not have permission to create family data.` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const family = await familyService.createFamily(body)
    return NextResponse.json(
      { message: 'Family created successfully', data: family },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create family' },
      { status: 500 }
    )
  }
}
