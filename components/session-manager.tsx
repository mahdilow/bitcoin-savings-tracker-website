"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, LogOut, ShieldAlert, ShieldCheck } from "lucide-react"
import { terminateAllSessions } from "@/app/account/actions"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SessionManagerProps {
  initialSessionCount?: number
}

export function SessionManager({ initialSessionCount = 1 }: SessionManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const hasOtherSessions = initialSessionCount > 1

  const handleTerminateSessions = async () => {
    try {
      setIsLoading(true)
      await terminateAllSessions()
      // After terminating all sessions, we redirect to login
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
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasOtherSessions ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"}`}
          >
            {hasOtherSessions ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">سایر نشست‌ها</p>
            <p className="text-xs text-muted-foreground">
              {hasOtherSessions ? `${initialSessionCount - 1} نشست دیگر فعال است` : "نشست دیگری فعال نیست"}
            </p>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                {" "}
                {/* Span needed to enable tooltip on disabled button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTerminateSessions}
                  disabled={isLoading || !hasOtherSessions}
                  className={`gap-2 bg-transparent ${
                    hasOtherSessions
                      ? "hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-200"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  خروج از همه دستگاه‌ها
                </Button>
              </span>
            </TooltipTrigger>
            {!hasOtherSessions && (
              <TooltipContent>
                <p>هیچ نشست فعال دیگری برای بستن وجود ندارد</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
