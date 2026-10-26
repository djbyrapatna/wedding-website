import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. The service-role key bypasses RLS and must
// never be exposed to the browser. All call sites are Next.js API routes
// (src/app/api/**), which run on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        // Bypass Next.js's fetch Data Cache so every read reflects the latest
        // database state. Without this, Next can cache a Supabase GET response
        // (e.g. honeymoon totals) and keep serving a stale snapshot — which
        // made new contributions appear to "not show up" on the site.
        global: {
          fetch: (input, init) =>
            fetch(input as RequestInfo, { ...init, cache: "no-store" }),
        },
      })
    : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
