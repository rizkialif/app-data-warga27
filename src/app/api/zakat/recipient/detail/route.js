import { NextResponse } from 'next/server'
import * as zakatRecipientService from '@/services/zakatRecipient.shared'
import { hasPermission } from '@/utils/permission'

export async function PUT(request) {
  try {
    if (!hasPermission(request, 'action:update:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update zakat recipients.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'Recipient ID is required' }, { status: 400 })
    }

    const recipient = await zakatRecipientService.updateRecipient(id, body)
    return NextResponse.json({
      message: 'Zakat recipient updated successfully',
      data: recipient
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to update zakat recipient' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    if (!hasPermission(request, 'action:delete:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to delete zakat recipients.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Recipient ID is required' }, { status: 400 })
    }

    await zakatRecipientService.deleteRecipient(id)
    return NextResponse.json({
      message: 'Zakat recipient deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete zakat recipient' },
      { status: 500 }
    )
  }
}
