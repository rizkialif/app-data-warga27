import { NextResponse } from 'next/server'
import * as zakatRecipientService from '@/services/zakatRecipient.shared'
import { hasPermission } from '@/utils/permission'

export async function GET(request) {
  try {
    const recipients = await zakatRecipientService.getAllRecipients()
    return NextResponse.json({
      message: 'Zakat recipients retrieved successfully',
      data: recipients
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to retrieve zakat recipients' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    if (!hasPermission(request, 'action:create:zakat')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to create zakat recipients.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const recipient = await zakatRecipientService.createRecipient(body)
    return NextResponse.json(
      { message: 'Zakat recipient created successfully', data: recipient },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create zakat recipient' },
      { status: 400 }
    )
  }
}
