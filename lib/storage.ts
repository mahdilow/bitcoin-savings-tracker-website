import { createSupabaseClient } from "@/lib/supabase/client"
import type { Purchase } from "./types"

const STORAGE_KEY = "oryn-purchases"
const CLOUD_SYNC_KEY = "oryn-cloud-sync-enabled"

export const storage = {
  // Load purchases from localStorage
  loadPurchases(): Purchase[] {
    if (typeof window === "undefined") return []

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const purchases = JSON.parse(data) as Purchase[]

      // Validate data structure
      if (!Array.isArray(purchases)) return []

      return purchases.filter(
        (p) =>
          p.id &&
          p.date &&
          typeof p.btcAmount === "number" &&
          typeof p.usdPriceAtPurchase === "number" &&
          typeof p.totalUsdSpent === "number",
      )
    } catch (error) {
      console.error("Failed to load purchases from localStorage:", error)
      return []
    }
  },

  // Save purchases to localStorage
  savePurchases(purchases: Purchase[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases))
    } catch (error) {
      console.error("Failed to save purchases to localStorage:", error)
    }
  },

  // Clear all purchases
  clearPurchases(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear purchases from localStorage:", error)
    }
  },

  // Check if cloud sync is enabled
  isCloudSyncEnabled(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem(CLOUD_SYNC_KEY) === "true"
  },

  // Enable cloud sync
  enableCloudSync(): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CLOUD_SYNC_KEY, "true")
  },

  // Disable cloud sync
  disableCloudSync(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(CLOUD_SYNC_KEY)
  },

  // Sync purchases to Supabase
  async syncPurchasesToSupabase(purchases: Purchase[]): Promise<void> {
    const supabase = createSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Delete existing purchases for this user
    const { error: deleteError } = await supabase.from("purchases").delete().eq("user_id", user.id)

    if (deleteError) {
      throw deleteError
    }

    const purchasesToSync = purchases.map((p) => ({
      user_id: user.id,
      date: p.date,
      amount_btc: p.btcAmount,
      price_usd: p.usdPriceAtPurchase,
    }))

    if (purchasesToSync.length > 0) {
      const { error: insertError } = await supabase.from("purchases").insert(purchasesToSync)

      if (insertError) {
        throw insertError
      }
    }
  },
}
