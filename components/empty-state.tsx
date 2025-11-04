"use client"

import type React from "react"

import { TrendingUp, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import type { Purchase } from "@/lib/types"

interface EmptyStateProps {
  onAddFirst: () => void
  onImport: (purchases: Purchase[]) => void
}

export function EmptyState({ onAddFirst, onImport }: EmptyStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()

    try {
      if (file.name.endsWith(".json")) {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          const validPurchases = data.filter(
            (p) =>
              p.date &&
              typeof p.btcAmount === "number" &&
              typeof p.usdPriceAtPurchase === "number" &&
              typeof p.totalUsdSpent === "number",
          )
          onImport(validPurchases)
        }
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").slice(1) // Skip header
        const purchases: Purchase[] = lines
          .filter((line) => line.trim())
          .map((line, index) => {
            const [date, btcAmount, usdPrice, totalSpent, notes] = line.split(",")
            return {
              id: `imported-${Date.now()}-${index}`,
              date: date.trim(),
              btcAmount: Number.parseFloat(btcAmount),
              usdPriceAtPurchase: Number.parseFloat(usdPrice),
              totalUsdSpent: Number.parseFloat(totalSpent),
              notes: notes?.trim() || undefined,
            }
          })
          .filter((p) => !Number.isNaN(p.btcAmount) && !Number.isNaN(p.usdPriceAtPurchase))

        onImport(purchases)
      }
    } catch (error) {
      alert("خطا در خواندن فایل. لطفاً فرمت فایل را بررسی کنید.")
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <TrendingUp className="w-10 h-10 text-primary" />
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">شروع سفر پس‌انداز بیت‌کوین</h3>

      <p className="text-muted-foreground mb-8 max-w-md text-pretty">
        هنوز هیچ خریدی ثبت نکرده‌اید. اولین خرید خود را اضافه کنید و رشد سرمایه‌گذاری خود را دنبال کنید
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Button
          onClick={onAddFirst}
          size="lg"
          className="h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 ml-2" />
          افزودن اولین خرید
        </Button>

        <Button
          onClick={handleImportClick}
          size="lg"
          variant="outline"
          className="h-12 px-8 rounded-full border-primary text-primary hover:bg-primary/10 bg-transparent"
        >
          <Upload className="w-5 h-5 ml-2" />
          وارد کردن از فایل
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
