import { NextResponse } from 'next/server'
import * as zakatCollectionService from '@/services/zakatCollection.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update zakat collection.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'Collection ID is required' }, { status: 400 })
    }

    const collection = await zakatCollectionService.updateCollection(id, body)
    return NextResponse.json({
      message: 'Zakat collection updated successfully',
      data: collection
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update zakat collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete zakat collection.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Collection ID is required' }, { status: 400 })
    }

    await zakatCollectionService.deleteCollection(id)
    return NextResponse.json({
      message: 'Zakat collection deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete zakat collection' },
      { status: 500 }
    )
  }
}
