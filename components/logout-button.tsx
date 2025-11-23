"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { storage } from "@/lib/storage"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      storage.clearPurchases()
      storage.disableCloudSync()

      await supabase.auth.signOut()
      router.refresh()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="destructive" className="w-full gap-2 mt-4" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="w-4 h-4" />
      {isLoading ? "در حال خروج..." : "خروج از حساب کاربری"}
    </Button>
  )
}
