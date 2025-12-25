import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing in middleware. Skipping auth check.")
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
      cookieOptions: {
        name: "oryn-auth",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })

    // Do not run Supabase middleware on static files or assets
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.includes(".") ||
      request.nextUrl.pathname.startsWith("/api")
    ) {
      return supabaseResponse
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes pattern
    if (request.nextUrl.pathname.startsWith("/account") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("[Middleware] Auth check failed:", error instanceof Error ? error.message : "Unknown error")
    return supabaseResponse
  }
}
