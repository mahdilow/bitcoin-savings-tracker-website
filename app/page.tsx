"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus } from 'lucide-react'
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
    const loadedPurchases = storage.loadPurchases()
    setPurchases(loadedPurchases)
    setIsLoaded(true)
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
        const data = await response.json()
        setCurrentBTCPriceIRT(Number.parseFloat(data.stats["btc-rls"].latest) / 10)
      } catch (error) {
        console.error("Failed to fetch IRT price:", error)
      }
    }

    fetchIrtPrice()
    const interval = setInterval(fetchIrtPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentBTCPrice(price)
  }, [])

  const handleSavePurchase = (purchaseData: Omit<Purchase, "id">) => {
    if (editingPurchase) {
      setPurchases((prev) =>
        prev.map((p) => (p.id === editingPurchase.id ? { ...purchaseData, id: editingPurchase.id } : p)),
      )
      setEditingPurchase(null)
    } else {
      const newPurchase: Purchase = {
        ...purchaseData,
        id: Date.now().toString(),
      }
      setPurchases((prev) =>
        [...prev, newPurchase].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      )
    }
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setIsDialogOpen(true)
  }

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDeleteMultiplePurchases = (ids: string[]) => {
    setPurchases((prev) => prev.filter((p) => !ids.includes(p.id)))
  }

  const handleImportPurchases = (importedPurchases: Purchase[]) => {
    setPurchases((prev) => {
      const combined = [...prev, ...importedPurchases]
      return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <ThemeToggle />
        <CloudSyncButton purchases={purchases} />
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
