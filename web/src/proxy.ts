import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Solo proteger rutas de admin
    "/admin(.*)",
    // Clerk internals
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/__clerk/(.*)",
  ],
};
