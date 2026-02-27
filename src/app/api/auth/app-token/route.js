import { NextResponse } from 'next/server'
import { generateAppToken } from '@/services/auth.shared'

export async function GET() {
  try {
    const token = await generateAppToken()

    return NextResponse.json({
      message: 'Application token generated',
      data: {
        app_token: token
      }
    })
  } catch (error) {
    console.error('Failed to generate application token:', error)
    return NextResponse.json(
      {
        message: 'Failed to generate application token',
        error: error.message
      },
      { status: 500 }
    )
  }
}
