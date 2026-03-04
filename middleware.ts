import { authMiddleware } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const hasClerkEnv =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const clerkMiddleware = authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/signin(.*)", "/signup(.*)"],
  // Routes to completely ignore (no auth processing)
  ignoredRoutes: ["/api/public"],
  // Allow API routes to pass through to handlers
  afterAuth(auth, req) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
  },
});

if (!hasClerkEnv) {
  console.error(
    "[middleware] Missing Clerk env vars. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY on Vercel."
  );
}

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (!hasClerkEnv) {
    return NextResponse.next();
  }

  try {
    return await clerkMiddleware(req, evt);
  } catch (error) {
    console.error("[middleware] Clerk middleware invocation failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
