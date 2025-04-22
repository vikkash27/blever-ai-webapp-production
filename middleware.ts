import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  "/sign-in",
  "/sign-up"
];

// Define authentication exempt paths (no redirects needed)
const authExemptPaths = [
  "/_next",
  "/favicon.ico",
  // Add other static assets paths if needed
];

// Pages that can be accessed after authentication but before org selection/verification
const postAuthPaths = [
  "/select-organization"
];

// Pages that require full organization access permission
const protectedPaths = [
  "/dashboard",
  "/data-management",
  "/upload-guide"
];

/**
 * Checks if an organization has access permission from the request headers
 */
async function checkOrgAccess(request: NextRequest, orgId: string | null): Promise<boolean> {
  if (!orgId) return false;
  
  try {
    // Get the authorization token from the request cookies
    const authCookie = request.cookies.get('__session')?.value;
    if (!authCookie) return false;
    
    // In middleware, we need to work with the raw cookies
    // The best approach is to redirect to the organization selection page
    // where the client-side code can properly check the organization's access
    return true; // Simplified for middleware - we'll just verify they have an org selected
  } catch (error) {
    console.error("Error in middleware organization check:", error);
    return false;
  }
}

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
  
  // Check if path is a post-auth path (accessible after login but before org verification)
  const isPostAuthPath = postAuthPaths.some(postAuthPath => 
    path.startsWith(postAuthPath)
  );
  
  // Check if the path requires full organization access permission
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  // If it's the root path ("/") and user is authenticated
  if (path === "/" && userId) {
    // Redirect to organization selection page first
    return NextResponse.redirect(new URL('/select-organization', request.url));
  }
  
  // If user is not authenticated and trying to access protected route
  if (!userId && !isPublicPath) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', path === '/' ? '/select-organization' : path);
    return NextResponse.redirect(signInUrl);
  }
  
  // If user is trying to access a fully protected path, verify they have an org
  if (isProtectedPath) {
    // If not authenticated, redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', path);
      return NextResponse.redirect(signInUrl);
    }
    
    // If no organization ID, redirect to organization selection page
    if (!orgId) {
      return NextResponse.redirect(new URL('/select-organization', request.url));
    }
    
    // In middleware, we can't easily check organization metadata
    // So we'll do a simplified check and let the client component validate further
    const hasOrg = await checkOrgAccess(request, orgId);
    
    if (!hasOrg) {
      return NextResponse.redirect(new URL('/select-organization', request.url));
    }
  }
  
  // If authenticated but trying to access protected route (not in post-auth paths)
  // Direct them to organization selection first
  if (userId && !isPublicPath && !isPostAuthPath && !isProtectedPath && path !== '/select-organization') {
    // For any other authenticated routes that aren't explicitly handled above
    return NextResponse.redirect(new URL('/select-organization', request.url));
  }
  
  // Allow access to all other routes based on the rules above
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except those starting with static asset extensions
    '/((?!_next|api|trpc).*)',
    '/',
  ],
};

