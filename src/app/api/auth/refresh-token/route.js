import { NextResponse } from 'next/server'
import * as authService from '@/services/auth.shared'

export async function POST(request) {
  try {
    const { refreshToken } = await request.json()
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const result = await authService.refreshToken(refreshToken)
    
    const response = NextResponse.json({
      message: 'Token refreshed successfully',
      data: result
    })

    response.cookies.set('accessToken', result.accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Refresh token failed' },
      { status: 401 }
    )
  }
}
