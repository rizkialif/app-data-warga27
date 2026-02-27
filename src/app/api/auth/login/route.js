import { NextResponse } from 'next/server'
import * as authService from '@/services/auth.shared'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    const result = await authService.login(username, password)
    
    const response = NextResponse.json({
      message: 'Login successful',
      data: result
    })

    // Set cookie for middleware
    response.cookies.set('accessToken', result.accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day (match your refresh token logic or slightly more than access token)
      httpOnly: false, // Set to false so client can also see it if needed, or true for better security
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 401 }
    )
  }
}
