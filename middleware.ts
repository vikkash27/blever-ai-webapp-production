import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  "/sign-in",
  "/sign-up", 
  "/demo-request"
];

// Define authentication exempt paths (no redirects needed)
const authExemptPaths = [
  "/_next",
  "/favicon.ico",
  // Add other static assets paths if needed
];

export async function middleware(request: NextRequest) {
  // Get current path
  const path = request.nextUrl.pathname;
  
  // Skip middleware for exempt paths
  if (authExemptPaths.some(exemptPath => path.startsWith(exemptPath))) {
    return NextResponse.next();
  }
  
  // Get the auth context
  const { userId, orgId } = getAuth(request);
  
  // Check if the path is in the public paths
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  );
  
  // If it's the root path ("/") and user is authenticated
  if (path === "/" && userId) {
    // If user has an org, redirect to dashboard
    if (orgId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If user has no org, redirect to demo request
    else {
      return NextResponse.redirect(new URL('/demo-request', request.url));
    }
  }
  
  // If user is not authenticated and trying to access protected route
  if (!userId && !isPublicPath) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If authenticated but no active organization and trying to access protected route
  if (userId && !orgId && !isPublicPath && path !== '/demo-request') {
    return NextResponse.redirect(new URL('/demo-request', request.url));
  }
  
  // Allow access to all other routes based on the rules above
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except those starting with static asset extensions
    // and exclude the organizations update API endpoint
    '/((?!_next|api/organizations/update|api|trpc).*)',
    '/',
  ],
};

