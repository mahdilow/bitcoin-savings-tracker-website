"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoogleLogin = async () => {
    if (!mounted) return
    
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Attempting Google OAuth login with redirect:", redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      console.log("[v0] OAuth response:", { data, error })

      if (error) {
        console.error("[v0] OAuth error:", error)
        throw error
      }
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "خطایی رخ داده است")
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center mb-2">
              <Image src="/oryn-logo.png" alt="Oryn" width={120} height={40} className="h-10 w-auto" />
            </div>
            <CardTitle className="text-3xl font-bold">خوش آمدید</CardTitle>
            <CardDescription className="text-base">برای ورود یا ثبت‌نام با گوگل وارد شوید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/50 transition-all duration-200"
              variant="outline"
            >
              {isLoading ? (
                <span>در حال اتصال...</span>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>ورود با گوگل</span>
                </div>
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              با ورود به Oryn، شما{" "}
              <a href="#" className="text-primary hover:underline">
                قوانین و مقررات
              </a>{" "}
              را می‌پذیرید
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>با استفاده از Oryn، داده‌های شما به صورت امن ذخیره می‌شوند</p>
        </div>
      </div>
    </div>
  )
}
