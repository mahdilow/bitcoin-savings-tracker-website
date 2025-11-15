"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react'
import { formatCurrency, formatNumber } from "@/lib/utils"
import type { BitcoinPrice } from "@/lib/types"
import { apiCache, CACHE_DURATIONS } from "@/lib/api-cache" // Import apiCache and CACHE_DURATIONS

interface PriceTickerProps {
  onPriceUpdate: (price: number) => void
  currentBTCPriceIRT: number
}

export function PriceTicker({ onPriceUpdate, currentBTCPriceIRT }: PriceTickerProps) {
  const [price, setPrice] = useState<BitcoinPrice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const fetchPrice = async () => {
      try {
        const cacheKey = "btc_price_simple"
        
        const cached = apiCache.get<BitcoinPrice>(cacheKey)

        if (cached) {
          setPrice(cached)
          onPriceUpdate(cached.usd)
          setIsLoading(false)
          return
        }

        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
        )
        
        if (!response.ok) {
          // If rate limited, try to use expired cache or show error
          const expiredCache = apiCache.get<BitcoinPrice>(cacheKey, true) // Get even if expired
          if (expiredCache) {
            console.log("[v0] Using expired cache due to rate limit")
            setPrice(expiredCache)
            onPriceUpdate(expiredCache.usd)
            setIsLoading(false)
            return
          }
          throw new Error(`API returned status ${response.status}`)
        }

        const data = await response.json()
        
        if (!data.bitcoin || typeof data.bitcoin.usd === 'undefined') {
          throw new Error("Invalid API response structure")
        }

        const newPrice = {
          usd: data.bitcoin.usd,
          usd_24h_change: data.bitcoin.usd_24h_change || 0,
        }

        apiCache.set(cacheKey, newPrice, CACHE_DURATIONS.PRICE_TICKER)

        setPrice(newPrice)
        onPriceUpdate(newPrice.usd)
        setIsLoading(false)

        setIsPulsing(true)
        setTimeout(() => setIsPulsing(false), 1000)
      } catch (error) {
        console.error("[v0] Failed to fetch Bitcoin price:", error)
        if (!price) {
          setIsLoading(false)
        }
      }
    }

    const startFetching = () => {
      fetchPrice()
      if (interval) clearInterval(interval)
      interval = setInterval(fetchPrice, 60000)
    }

    const stopFetching = () => {
      if (interval) clearInterval(interval)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopFetching()
      } else {
        startFetching()
      }
    }

    startFetching()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      stopFetching()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [onPriceUpdate])

  if (isLoading) {
    return (
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-center gap-4">
          <div className="animate-spin">
            <Bitcoin className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </Card>
    )
  }

  if (!price) {
    return (
      <Card className="p-6 border-destructive/20 bg-card">
        <p className="text-center text-destructive">خطا در دریافت قیمت</p>
      </Card>
    )
  }

  const isPositive = price.usd_24h_change >= 0

  return (
    <Card
      className={`p-6 border-primary/20 bg-gradient-to-br from-card to-card/50 transition-all duration-300 ${isPulsing ? "ring-2 ring-primary/50" : ""}`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bitcoin className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">قیمت فعلی بیت‌کوین</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(price.usd)}</p>
            {currentBTCPriceIRT > 0 && (
              <p className="text-xl font-bold text-muted-foreground mt-1">
                {formatCurrency(currentBTCPriceIRT, "IRT")}
              </p>
            )}
          </div>
        </div>

        <div className="text-left">
          <p className="text-sm text-muted-foreground mb-1">تغییر ۲۴ ساعت</p>
          <div
            className={`flex items-center gap-2 text-xl font-semibold ${isPositive ? "text-success" : "text-destructive"}`}
          >
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {isPositive ? "+" : ""}
              {formatNumber(price.usd_24h_change.toFixed(2))}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
