import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/demo-request"
]);

// This function will be called for every request
export default clerkMiddleware((auth, req) => {
  // Get current path
  const url = req.nextUrl;
  const path = url.pathname;
  
  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // If user is not authenticated, redirect to sign-in
  if (!auth.isSignedIn) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // THE MOST IMPORTANT CHECK: If authenticated but no active organization, redirect to demo request
  // This is what prevents accessing the dashboard when no organization is selected
  if (!auth.isActiveOrgMember && !isPublicRoute(req) && path !== '/demo-request') {
    return NextResponse.redirect(new URL('/demo-request', req.url));
  }
  
  // Otherwise, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next internal paths
    "/((?!_next/image|_next/static|favicon.ico|.*\\.svg$).*)",
  ],
};

