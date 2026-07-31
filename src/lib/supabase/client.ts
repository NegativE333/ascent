import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

const SIXTY_DAYS = 60 * 60 * 24 * 60;

export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key, {
    cookieOptions: {
      maxAge: SIXTY_DAYS,
      sameSite: "lax",
      path: "/",
    },
  });
}
