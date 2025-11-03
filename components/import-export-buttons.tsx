"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import type { Purchase } from "@/lib/types"

interface ImportExportButtonsProps {
  purchases: Purchase[]
  onImport: (purchases: Purchase[]) => void
}

export function ImportExportButtons({ purchases, onImport }: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportCSV = () => {
    const headers = ["تاریخ", "مقدار بیت‌کوین", "قیمت دلار", "مجموع پرداختی", "یادداشت"]
    const rows = purchases.map((p) => [
      p.date,
      p.btcAmount.toString(),
      p.usdPriceAtPurchase.toString(),
      p.totalUsdSpent.toString(),
      p.notes || "",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `bitcoin-purchases-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(purchases, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `bitcoin-purchases-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

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
    <div className="flex gap-2 flex-wrap">
      <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileChange} className="hidden" />
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="border-primary text-primary hover:bg-primary/10 bg-transparent"
      >
        <Upload className="w-4 h-4 ml-2" />
        وارد کردن
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={purchases.length === 0}
        className="border-border text-foreground hover:bg-muted bg-transparent"
      >
        <Download className="w-4 h-4 ml-2" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportJSON}
        disabled={purchases.length === 0}
        className="border-border text-foreground hover:bg-muted bg-transparent"
      >
        <Download className="w-4 h-4 ml-2" />
        JSON
      </Button>
    </div>
  )
}
