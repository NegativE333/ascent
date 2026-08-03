"use server";

import { createClient } from "@/lib/supabase/server";
import { getOriginFromHeaders } from "@/lib/site-url";

export async function sendMagicLink(email: string) {
  const origin = await getOriginFromHeaders();
  const redirectTo = `${origin}/auth/callback`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { ok: false as const, error: error.message, redirectTo };
  }

  return { ok: true as const, redirectTo };
}
