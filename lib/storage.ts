import type { Purchase } from "./types"

const STORAGE_KEY = "oryn-purchases"

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
}
