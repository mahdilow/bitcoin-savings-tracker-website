import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("[v0] Callback received with code:", code ? "present" : "missing")

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log("[v0] Successfully exchanged code for session")

    if (data.user) {
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (userError) {
        console.error("[v0] Error creating user record:", userError)
      } else {
        console.log("[v0] User record ensured in database")
      }
    }
  }

  return NextResponse.redirect(`${origin}`)
}
