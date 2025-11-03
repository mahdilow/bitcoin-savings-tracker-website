"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteCard } from "@/components/quote-card";
import { PriceTicker } from "@/components/price-ticker";
import { MetricsCards } from "@/components/metrics-cards";
import { AddPurchaseDialog } from "@/components/add-purchase-dialog";
import { PurchaseHistory } from "@/components/purchase-history";
import { PortfolioChart } from "@/components/portfolio-chart";
import { mockPurchases } from "@/lib/mock-data";
import { quotes } from "@/lib/quotes";
import { getDailyQuote, calculateMetrics } from "@/lib/utils";
import type { Purchase } from "@/lib/types";

export default function DashboardPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [currentBTCPrice, setCurrentBTCPrice] = useState(67000);
  const [currentBTCPriceIRT, setCurrentBTCPriceIRT] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const dailyQuote = getDailyQuote(quotes);
  const metrics = calculateMetrics(
    purchases,
    currentBTCPrice,
    currentBTCPriceIRT
  );

  useEffect(() => {
    const fetchIrtPrice = async () => {
      try {
        const response = await fetch("/api/nobitex", {
          method: "POST",
        })
        const data = await response.json()
        // The price is in Rials, so we divide by 10 to get Tomans
        setCurrentBTCPriceIRT(parseFloat(data.stats["btc-rls"].latest) / 10)
      } catch (error) {
        console.error("Failed to fetch IRT price:", error)
      }
    }

    fetchIrtPrice();
    const interval = setInterval(fetchIrtPrice, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentBTCPrice(price);
  }, []);

  const handleSavePurchase = (purchaseData: Omit<Purchase, "id">) => {
    if (editingPurchase) {
      // Update existing purchase
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === editingPurchase.id
            ? { ...purchaseData, id: editingPurchase.id }
            : p
        )
      );
      setEditingPurchase(null);
    } else {
      // Add new purchase
      const newPurchase: Purchase = {
        ...purchaseData,
        id: Date.now().toString(),
      };
      setPurchases((prev) =>
        [...prev, newPurchase].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    }
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsDialogOpen(true);
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleImportPurchases = (importedPurchases: Purchase[]) => {
    setPurchases((prev) => {
      const combined = [...prev, ...importedPurchases];
      return combined.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPurchase(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in pt-12 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            داشبورد پس‌انداز بیت‌کوین
          </h1>
          <p className="text-muted-foreground">
            پرتفوی خود را مدیریت و رشد سرمایه‌گذاری خود را دنبال کنید
          </p>
        </div>

        {/* Quote of the Day */}
        <QuoteCard quote={dailyQuote} />

        {/* Bitcoin Price Ticker */}
        <PriceTicker onPriceUpdate={handlePriceUpdate} currentBTCPriceIRT={currentBTCPriceIRT} />

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* Portfolio Chart */}
        <PortfolioChart
          purchases={purchases}
          currentBTCPrice={currentBTCPrice}
        />

        {/* Purchase History */}
        <PurchaseHistory
          purchases={purchases}
          onEdit={handleEditPurchase}
          onDelete={handleDeletePurchase}
          onImport={handleImportPurchases}
        />

        {/* Floating Add Button */}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-8 left-8 h-14 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 z-50"
        >
          <Plus className="w-5 h-5 ml-2" />
          افزودن خرید
        </Button>

        {/* Add/Edit Purchase Dialog */}
        <AddPurchaseDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSave={handleSavePurchase}
          currentBTCPrice={currentBTCPrice}
          editingPurchase={editingPurchase}
        />
      </div>
    </div>
  );
}
