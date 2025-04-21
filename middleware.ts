import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/demo-request"
];

export async function middleware(request: NextRequest) {
  // Get current path
  const path = request.nextUrl.pathname;
  
  // Check if the path is in the public paths
  const isPublicPath = publicPaths.some(publicPath => {
    if (publicPath === "/") return path === publicPath;
    return path.startsWith(publicPath);
  });
  
  // If it's a public route, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the auth context
  const { userId, orgId } = getAuth(request);
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If authenticated but no active organization, redirect to demo request
  if (!orgId && path !== '/demo-request') {
    return NextResponse.redirect(new URL('/demo-request', request.url));
  }
  
  // Otherwise, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

