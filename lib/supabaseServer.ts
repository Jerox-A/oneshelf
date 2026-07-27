import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://zzcpkxsyhexixfxzijnf.supabase.co",
    "sb_publishable_9VhXfq4Smf-bOq_enBRbvg_NBPeIByn",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot always set cookies.
            // Middleware/login client handles session refresh.
          }
        },
      },
    }
  );
}