"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Purchase } from "@/lib/types"

interface CloudSyncButtonProps {
  purchases: Purchase[]
  onSyncComplete?: () => void
  isSyncing?: boolean
}

export function CloudSyncButton({ purchases, onSyncComplete, isSyncing: externalIsSyncing }: CloudSyncButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)
  const [internalIsSyncing, setInternalIsSyncing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const isSyncing = externalIsSyncing || internalIsSyncing

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
    checkSyncStatus()
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthStatus()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    const supabase = createSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event, !!session)
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [mounted])

  const checkAuthStatus = async () => {
    try {
      const supabase = createSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log("[v0] Current session status:", !!session)
      setIsLoggedIn(!!session)

      if (session?.user) {
        const { count, error } = await supabase.from("purchases").select("*", { count: "exact", head: true })

        if (!error && count !== null && count > 0) {
          console.log("[v0] User has existing data, enabling sync status")
          storage.enableCloudSync()
          setIsSynced(true)
        }
      }
    } catch (error) {
      console.error("Failed to check auth status:", error)
      setIsLoggedIn(false)
    }
  }

  const checkSyncStatus = () => {
    if (typeof window === "undefined") return
    setIsSynced(storage.isCloudSyncEnabled())
  }

  const handleSyncClick = async () => {
    if (!mounted) return

    // Check if user is logged in
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    // If already synced, just show status
    if (isSynced) {
      alert("داده‌های شما در حال حاضر با ابر همگام‌سازی شده است")
      return
    }

    // Show policy dialog
    setShowPolicyDialog(true)
  }

  const handleAcceptPolicy = async () => {
    setShowPolicyDialog(false)
    setInternalIsSyncing(true)

    try {
      await storage.syncPurchasesToSupabase(purchases)

      // Mark as synced
      storage.enableCloudSync()
      setIsSynced(true)
      onSyncComplete?.()

      alert("همگام‌سازی با موفقیت انجام شد!")
    } catch (error) {
      console.error("[v0] Sync failed:", error)
      const errorMessage = error instanceof Error ? error.message : "خطای ناشناخته"
      alert(`خطا در همگام‌سازی: ${errorMessage}\nلطفاً دوباره تلاش کنید.`)
    } finally {
      setInternalIsSyncing(false)
    }
  }

  if (!mounted) return null

  const getTooltipText = () => {
    if (isSyncing) return "در حال همگام‌سازی..."
    if (isLoggedIn && isSynced) return "همگام با ابر"
    if (isLoggedIn && !isSynced) return "همگام‌سازی با ابر"
    return "ورود برای همگام‌سازی"
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSyncClick}
              disabled={isSyncing}
              variant={isSynced ? "default" : "ghost"}
              className={
                isSynced
                  ? "w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 animate-pulse"
                  : "w-10 h-10 rounded-full text-primary hover:bg-primary/10"
              }
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSynced ? (
                <Cloud className="w-4 h-4" />
              ) : (
                <CloudOff className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-right">سیاست حفظ حریم خصوصی</DialogTitle>
            <DialogDescription className="text-right space-y-4 pt-4" dir="rtl">
              <p className="text-foreground font-medium">با فعال‌سازی همگام‌سازی ابری، موارد زیر اعمال می‌شود:</p>

              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>تمام داده‌های خرید شما در پایگاه داده امن ما ذخیره می‌شود</li>
                <li>این داده‌ها تنها زمانی قابل مشاهده است که به حساب کاربری خود وارد شوید</li>
                <li>داده‌های شما با رمزنگاری محافظت می‌شوند</li>
                <li>می‌توانید هر زمان همگام‌سازی را غیرفعال کنید</li>
                <li>ما هیچ‌گاه اطلاعات شما را با شخص ثالث به اشتراک نمی‌گذاریم</li>
              </ul>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>توجه:</strong> اگر نمی‌خواهید داده‌های خود را در ابر ذخیره کنید، می‌توانید از دکمه‌های «وارد کردن»
                  و «خروجی CSV/JSON» برای ذخیره‌سازی محلی داده‌ها استفاده کنید.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
              انصراف
            </Button>
            <Button onClick={handleAcceptPolicy} className="bg-success hover:bg-success/90">
              موافقم، همگام‌سازی کن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
