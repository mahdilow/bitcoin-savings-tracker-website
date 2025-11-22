"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, LogOut, ShieldAlert } from "lucide-react"
import { terminateAllSessions } from "@/app/account/actions"
import { useRouter } from "next/navigation"

export function SessionManager() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleTerminateSessions = async () => {
    try {
      setIsLoading(true)
      await terminateAllSessions()
      // After terminating all sessions (which includes the current one usually in strict implementations,
      // but Supabase Admin signOut might just invalidate refreshes),
      // we should redirect to login to be safe and force re-auth.
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to terminate sessions:", error)
      alert("خطا در پایان دادن به نشست‌ها.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">نشست فعال فعلی</p>
            <p className="text-xs text-muted-foreground">دستگاه کنونی شما</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-500 font-medium px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            آنلاین
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">سایر نشست‌ها</p>
            <p className="text-xs text-muted-foreground">اگر دستگاه مشکوکی می‌بینید، همه را خارج کنید</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTerminateSessions}
          disabled={isLoading}
          className="gap-2 hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-200 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          خروج از همه دستگاه‌ها
        </Button>
      </div>
    </div>
  )
}
