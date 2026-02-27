import { NextResponse } from 'next/server'
import * as familyService from '@/services/family.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const family = await familyService.getFamilyById(id)
    return NextResponse.json({
      message: 'Family retrieved successfully',
      data: family
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve family detail' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:family')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update family data.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const family = await familyService.updateFamily(id, body)
    return NextResponse.json({
      message: 'Family updated successfully',
      data: family
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update family' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:family')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete family data.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    await familyService.deleteFamily(id)
    return NextResponse.json({
      message: 'Family deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete family' },
      { status: 500 }
    )
  }
}
