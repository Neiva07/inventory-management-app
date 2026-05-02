import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const corsAllowedMethods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
const corsAllowedHeaders = [
  'authorization',
  'content-type',
  'x-client-id',
  'x-desktop-session-id',
  'x-internal-api-key',
  'x-local-user-id',
].join(', ')

const isPublicRoute = createRouteMatcher([
  '/',
  '/app-sign-in(.*)',
  '/download(.*)',
  '/landing(.*)',
  '/api/v1/health',
  '/api/v1/organizations(.*)',
  '/api/v1/dev-admin(.*)',
  '/api/v1/runtime-logs(.*)',
  '/api/v1/sync(.*)',
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])
const isCorsApiRoute = createRouteMatcher(['/api/v1(.*)'])
const isDevPage = createRouteMatcher(['/dev/logs(.*)', '/dev/admin(.*)'])

const getConfiguredCorsOrigins = (): string[] => {
  return (process.env.API_CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const isLocalhostOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'
  } catch {
    return false
  }
}

const getAllowedCorsOrigin = (origin: string | null): string | null => {
  if (!origin) {
    return null
  }

  const configuredOrigins = getConfiguredCorsOrigins()
  if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
    return origin
  }

  if (process.env.NODE_ENV !== 'production' && isLocalhostOrigin(origin)) {
    return origin
  }

  return null
}

const withCorsHeaders = (response: NextResponse, request: Request): NextResponse => {
  const allowedOrigin = getAllowedCorsOrigin(request.headers.get('origin'))
  if (!allowedOrigin) {
    return response
  }

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', corsAllowedMethods)
  response.headers.set('Access-Control-Allow-Headers', corsAllowedHeaders)
  response.headers.set('Access-Control-Max-Age', '600')
  response.headers.append('Vary', 'Origin')

  return response
}

export default clerkMiddleware(
  async (auth, request) => {
    if (isCorsApiRoute(request) && request.method === 'OPTIONS') {
      return withCorsHeaders(new NextResponse(null, { status: 204 }), request)
    }

    if (process.env.NODE_ENV !== 'production' && isDevPage(request)) {
      return NextResponse.next()
    }

    const authResult = await auth()
    if (!authResult.userId && !isPublicRoute(request)) {
      if (isApiRoute(request)) {
        return withCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request)
      }
      return authResult.redirectToSignIn({ returnBackUrl: '/landing' });
    }

    if (isCorsApiRoute(request)) {
      return withCorsHeaders(NextResponse.next(), request)
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
