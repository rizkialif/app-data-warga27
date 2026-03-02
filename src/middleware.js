import { NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/jwt'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Define paths that require authentication
  const protectedApiPaths = ['/api/master-data', '/api/users', '/api/family', '/api/resident', '/api/stats', '/api/zakat', '/api/pengurus']
  const protectedPagePaths = ['/dashboard']

  const isProtectedApi = protectedApiPaths.some(path => pathname.startsWith(path))
  const isProtectedPage = protectedPagePaths.some(path => pathname.startsWith(path))

  if (isProtectedApi || isProtectedPage) {
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('accessToken')?.value
    
    const token = authHeader ? authHeader.split(' ')[1] : cookieToken

    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json({ message: 'Access token required' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const decoded = await verifyTokenEdge(token)
      
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', String(decoded.userId))
      requestHeaders.set('x-user-role', String(decoded.role || ''))
      
      // Inject permissions into header if available
      if (decoded.permissions && Array.isArray(decoded.permissions)) {
        requestHeaders.set('x-user-permissions', JSON.stringify(decoded.permissions))
      }
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (err) {
      if (isProtectedApi) {
        let errorMessage = 'Access token invalid'
        if (err.code === 'ERR_JWT_EXPIRED') {
          errorMessage = 'Access token expired'
        } else if (err.code === 'ERR_JWS_INVALID' || err.code === 'ERR_JWT_MALFORMED') {
          errorMessage = 'Access token malformed or invalid signature'
        }

        return NextResponse.json(
          { message: errorMessage, error: err.message },
          { status: 401 }
        )
      }

      // For pages, redirect to login and clear the cookie
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('logoutReason', 'session_expired')
      response.cookies.set('accessToken', '', { expires: new Date(0) })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
