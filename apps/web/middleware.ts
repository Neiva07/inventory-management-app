import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/app-sign-in(.*)',
  '/download(.*)',
  '/landing(.*)',
  '/api/v1/health',
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware(
  async (auth, request) => {
    const authResult = await auth()
    if (!authResult.userId && !isPublicRoute(request)) {
      if (isApiRoute(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return authResult.redirectToSignIn({ returnBackUrl: '/landing' });
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
