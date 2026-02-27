import { NextResponse } from 'next/server'
import * as zakatCollectionService from '@/services/zakatCollection.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeType = searchParams.get('type') // either 'list' or 'summary'
    
    if (routeType === 'summary') {
      const summary = await zakatCollectionService.getCollectionSummary()
      return NextResponse.json({
        message: 'Zakat summary retrieved successfully',
        data: summary
      })
    } else {
      const collections = await zakatCollectionService.getAllCollections()
      return NextResponse.json({
        message: 'Zakat collections retrieved successfully',
        data: collections
      })
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve zakat collections' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to create zakat collection.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const collection = await zakatCollectionService.createCollection(body)
    return NextResponse.json(
      { message: 'Zakat collection created successfully', data: collection },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create zakat collection' },
      { status: 400 }
    )
  }
}
