import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/app-sign-in',
  '/app-sign-in/sso-callback(.*)',
  '/app-sign-in/create(.*)',
  '/download(.*)',
  '/landing(.*)',
])

export default clerkMiddleware(
  async (auth, request) => {
    const authResult = await auth()
    if (!authResult.userId && !isPublicRoute(request)) {
      return authResult.redirectToSignIn({ returnBackUrl: '/' });
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
