import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRole } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const env = getSupabaseServiceRole();

  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
