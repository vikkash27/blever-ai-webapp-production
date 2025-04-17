import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be publicly accessible
const isPublicRoute = createRouteMatcher([
  '/', // Allow access to the homepage
  '/sign-in(.*)', // Allow access to sign-in page and its sub-routes
  '/sign-up(.*)', // Allow access to sign-up page and its sub-routes
  '/upload-guide(.*)' // Make the upload guide public for now
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes that are not public
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

