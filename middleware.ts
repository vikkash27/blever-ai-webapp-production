import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/demo-request"
]);

// This function will be called for every request
export default clerkMiddleware(async (auth, req) => {
  // Get current path
  const path = req.nextUrl.pathname;
  
  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // If user is not authenticated, redirect to sign-in
  if (!auth.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If authenticated but no active organization, redirect to demo request
  if (!auth.orgId && path !== '/demo-request') {
    return NextResponse.redirect(new URL('/demo-request', req.url));
  }
  
  // Otherwise, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

