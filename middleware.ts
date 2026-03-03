import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/signin", "/signup"],
  // Routes to completely ignore (no auth processing)
  ignoredRoutes: ["/api/public"],
  // Allow API routes to pass through to handlers
  afterAuth(auth, req, evt) {
    // Allow all API routes to continue to their handlers
    // where getAuth(req) will be available
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    
    // For non-API routes, require authentication
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
