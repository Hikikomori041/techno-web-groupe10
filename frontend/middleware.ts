// middleware.ts (root of your project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note:
// We previously tried to enforce auth in middleware by calling the backend from the Edge runtime.
// This breaks with cross-origin cookies (Vercel frontend + Render backend).
// Auth is now enforced in client layouts (DashboardLayout, ProfileLayout), so the middleware just passes through.

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
