"use client"

import { useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { storage } from "@/lib/storage"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // 1. Clear local data first
      storage.clearPurchases()
      storage.disableCloudSync()

      // 2. Sign out from server & clear cookies
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()

      // 3. Force full reload to reset all app state
      window.location.href = "/"
    } catch (error) {
      console.error("Error logging out:", error)
      // Force reload anyway to ensure clean slate
      window.location.href = "/"
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="destructive" className="w-full sm:w-auto gap-2" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="w-4 h-4" />
      {isLoading ? "در حال خروج..." : "خروج از حساب کاربری"}
    </Button>
  )
}
