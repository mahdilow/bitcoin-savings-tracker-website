"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuoteCard } from "@/components/quote-card"
import { PriceTicker } from "@/components/price-ticker"
import { MetricsCards } from "@/components/metrics-cards"
import { AddPurchaseDialog } from "@/components/add-purchase-dialog"
import { PurchaseHistory } from "@/components/purchase-history"
import { PortfolioChart } from "@/components/portfolio-chart"
import { EmptyState } from "@/components/empty-state"
import { StatisticsPage } from "@/components/pages/statistics-page"
import { ThemeToggle } from "@/components/theme-toggle"
import { CloudSyncButton } from "@/components/cloud-sync-button"
import { createSupabaseClient } from "@/lib/supabase/client"
import { quotes } from "@/lib/quotes"
import { getDailyQuote, calculateMetrics } from "@/lib/utils"
import { storage } from "@/lib/storage"
import type { Purchase } from "@/lib/types"

export default function DashboardPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentBTCPrice, setCurrentBTCPrice] = useState(67000)
  const [currentBTCPriceIRT, setCurrentBTCPriceIRT] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [activePage, setActivePage] = useState<string>("home")
  const [isSyncing, setIsSyncing] = useState(false)

  const dailyQuote = getDailyQuote(quotes)
  const metrics = calculateMetrics(purchases, currentBTCPrice, currentBTCPriceIRT)

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const page = event.detail
      if (page === "home") {
        setActivePage("home")
      } else if (
        page === "dca" ||
        page === "buy" ||
        page === "statistics" ||
        page === "news" ||
        page === "achievements" ||
        page === "settings"
      ) {
        setActivePage(page)
      }
    }

    window.addEventListener("navigate", handleNavigate as EventListener)
    return () => window.removeEventListener("navigate", handleNavigate as EventListener)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      // 1. Load local data first to show something immediately
      const localPurchases = storage.loadPurchases()
      setPurchases(localPurchases)

      // 2. Check for authenticated user and fetch cloud data
      try {
        const supabase = createSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("[v0] User authenticated, fetching purchases from cloud...")
          const { data, error } = await supabase.from("purchases").select("*").order("date", { ascending: false })

          if (error) throw error

          if (data && data.length > 0) {
            console.log("[v0] Cloud purchases fetched:", data.length)
            const remotePurchases: Purchase[] = data.map((p) => ({
              id: p.id || Date.now().toString(),
              date: p.date,
              btcAmount: Number(p.amount_btc),
              usdPriceAtPurchase: Number(p.price_usd),
              totalUsdSpent: Number(p.amount_btc) * Number(p.price_usd),
            }))

            setPurchases(remotePurchases)
            storage.enableCloudSync()
          } else if (localPurchases.length > 0 && !storage.isCloudSyncEnabled()) {
            // For now, we just respect the cloud state. If cloud is empty, we keep local.
            // But we should probably enable sync so future adds go to cloud.
            storage.enableCloudSync()
          }
        }
      } catch (error) {
        console.error("[v0] Failed to sync with cloud:", error)
      }

      setIsLoaded(true)
    }

    loadData()
  }, [])

  useEffect(() => {
    if (isLoaded) {
      storage.savePurchases(purchases)
    }
  }, [purchases, isLoaded])

  useEffect(() => {
    const fetchIrtPrice = async () => {
      try {
        const response = await fetch("/api/nobitex", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data && data.stats && data.stats["btc-rls"] && data.stats["btc-rls"].latest) {
          setCurrentBTCPriceIRT(Number.parseFloat(data.stats["btc-rls"].latest) / 10)
        } else {
          console.warn("[v0] Invalid Nobitex API response structure:", data)
          // Keep previous price if update fails
        }
      } catch (error) {
        console.error("[v0] Failed to fetch IRT price:", error)
        // Continue with previous price, don't break the app
      }
    }

    fetchIrtPrice()
    const interval = setInterval(fetchIrtPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentBTCPrice(price)
  }, [])

  const syncData = async (newPurchases: Purchase[]) => {
    if (storage.isCloudSyncEnabled()) {
      setIsSyncing(true)
      try {
        await storage.syncPurchasesToSupabase(newPurchases)
        console.log("[v0] Auto-synced with cloud")
      } catch (error) {
        console.error("[v0] Auto-sync failed:", error)
      } finally {
        setIsSyncing(false)
      }
    }
  }

  const handleSavePurchase = (purchaseData: Omit<Purchase, "id">) => {
    let newPurchases: Purchase[] = []
    if (editingPurchase) {
      setPurchases((prev) => {
        newPurchases = prev.map((p) => (p.id === editingPurchase.id ? { ...purchaseData, id: editingPurchase.id } : p))
        return newPurchases
      })
      setEditingPurchase(null)
    } else {
      const newPurchase: Purchase = {
        ...purchaseData,
        id: Date.now().toString(),
      }
      setPurchases((prev) => {
        newPurchases = [...prev, newPurchase].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return newPurchases
      })
    }
    syncData(newPurchases)
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setIsDialogOpen(true)
  }

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => {
      const newPurchases = prev.filter((p) => p.id !== id)
      syncData(newPurchases)
      return newPurchases
    })
  }

  const handleDeleteMultiplePurchases = (ids: string[]) => {
    setPurchases((prev) => {
      const newPurchases = prev.filter((p) => !ids.includes(p.id))
      syncData(newPurchases)
      return newPurchases
    })
  }

  const handleImportPurchases = (importedPurchases: Purchase[]) => {
    setPurchases((prev) => {
      const combined = [...prev, ...importedPurchases]
      const newPurchases = combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      syncData(newPurchases)
      return newPurchases
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingPurchase(null)
    }
  }

  if (!isLoaded) {
    return null
  }

  const hasNoPurchases = purchases.length === 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <div className="absolute top-4 left-4 z-50 flex justify-start items-center gap-2">
        <CloudSyncButton purchases={purchases} isSyncing={isSyncing} />
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {activePage === "home" ? (
          <>
            <div className="text-center mb-8 animate-fade-in pt-4 md:pt-0">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">داشبورد پس‌انداز بیت‌کوین</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                پرتفوی خود را مدیریت و رشد سرمایه‌گذاری خود را دنبال کنید
              </p>
            </div>

            <QuoteCard quote={dailyQuote} />
            <PriceTicker onPriceUpdate={handlePriceUpdate} currentBTCPriceIRT={currentBTCPriceIRT} />

            {hasNoPurchases ? (
              <EmptyState onAddFirst={() => setIsDialogOpen(true)} onImport={handleImportPurchases} />
            ) : (
              <>
                <MetricsCards metrics={metrics} />
                <PortfolioChart purchases={purchases} currentBTCPrice={currentBTCPrice} />
                <PurchaseHistory
                  purchases={purchases}
                  onEdit={handleEditPurchase}
                  onDelete={handleDeletePurchase}
                  onDeleteMultiple={handleDeleteMultiplePurchases}
                  onImport={handleImportPurchases}
                />
              </>
            )}
          </>
        ) : activePage === "statistics" ? (
          <>
            <div className="text-center mb-8 animate-fade-in pt-4 md:pt-0">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">آمار و تحلیل</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                اطلاعات کامل بازار بیت‌کوین و تحلیل دقیق پرتفوی شما
              </p>
            </div>
            <StatisticsPage
              purchases={purchases}
              currentBTCPrice={currentBTCPrice}
              currentBTCPriceIRT={currentBTCPriceIRT}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-muted-foreground">به زودی...</h2>
            <p className="text-muted-foreground mt-2">این بخش در حال توسعه است</p>
          </div>
        )}

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-24 md:bottom-8 left-8 h-14 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 z-50"
        >
          <Plus className="w-5 h-5 ml-2" />
          افزودن خرید
        </Button>

        <AddPurchaseDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSave={handleSavePurchase}
          currentBTCPrice={currentBTCPrice}
          editingPurchase={editingPurchase}
        />
      </div>
    </div>
  )
}
