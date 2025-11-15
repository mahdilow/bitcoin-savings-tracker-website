import { createBrowserClient } from "@supabase/ssr"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) {
    return browserClient
  }

  if (typeof window === "undefined") {
    throw new Error("createClient can only be used in browser context")
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: "oryn-auth",
        secure: true,
        sameSite: "lax",
      },
    }
  )

  return browserClient
}

export const createSupabaseClient = createClient
