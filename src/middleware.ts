import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// API routes authenticate themselves, and the PWA files must stay reachable
// while signed out or the browser can't register the worker or offer install.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
