import { createClient } from "@supabase/supabase-js"

// Note: This client should ONLY be used in server-side contexts (API routes, Server Actions)
// Never expose the service role key to the client!
export const createAdminClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
