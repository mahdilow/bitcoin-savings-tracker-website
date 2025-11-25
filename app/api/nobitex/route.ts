import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// In-memory cache
let cachedData: any = null
let lastFetchTime = 0
const CACHE_DURATION = 60 * 1000 // 60 seconds

// This is used when all APIs fail - approximately 590,000 Toman per USD
const FALLBACK_USD_TO_IRT = 590000

export async function POST() {
  const now = Date.now()

  // Return in-memory cache if fresh
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedData)
  }

  // Try to get from Supabase cache first
  try {
    const supabase = await createClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: cachedPrice } = await supabase
      .from("bitcoin_prices")
      .select("irt_price, fetched_at")
      .gte("fetched_at", oneHourAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cachedPrice?.irt_price) {
      const responseData = {
        stats: {
          "btc-rls": {
            latest: String(cachedPrice.irt_price * 10), // Convert back to Rials
          },
        },
        source: "database_cache",
      }
      cachedData = responseData
      lastFetchTime = now
      return NextResponse.json(responseData)
    }
  } catch (dbError) {
    console.warn("[NOBITEX] Database cache check failed:", dbError)
  }

  const apis = [
    {
      name: "Nobitex",
      url: "https://api.nobitex.ir/market/stats?srcCurrency=btc&dstCurrency=rls",
      transform: (data: any) => {
        if (data?.stats?.["btc-rls"]?.latest) {
          return { latest: data.stats["btc-rls"].latest }
        }
        return null
      },
    },
    {
      name: "Nobitex V2",
      url: "https://api.nobitex.ir/v2/orderbook/BTCIRT",
      transform: (data: any) => {
        if (data?.lastTradePrice) {
          return { latest: String(Number(data.lastTradePrice) * 10) } // IRT to Rials
        }
        return null
      },
    },
  ]

  for (const api of apis) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; BitcoinTracker/1.0)",
        },
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`[NOBITEX] ${api.name} returned status ${response.status}`)
        continue
      }

      const data = await response.json()
      const transformed = api.transform(data)

      if (transformed) {
        const responseData = {
          stats: {
            "btc-rls": transformed,
          },
          source: api.name,
        }

        // Update in-memory cache
        cachedData = responseData
        lastFetchTime = now

        try {
          const supabase = await createClient()
          const irtPrice = Number(transformed.latest) / 10 // Convert Rials to Toman
          await supabase
            .from("bitcoin_prices")
            .update({ irt_price: irtPrice })
            .gte("fetched_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        } catch (saveError) {
          console.warn("[NOBITEX] Failed to save IRT price to database:", saveError)
        }

        return NextResponse.json(responseData)
      }
    } catch (error: any) {
      console.warn(`[NOBITEX] ${api.name} failed:`, error?.message || error)
      continue
    }
  }

  // Return stale cache if available
  if (cachedData) {
    console.warn("[NOBITEX] All APIs failed, returning stale cache")
    return NextResponse.json({ ...cachedData, stale: true })
  }

  // This ensures the app continues to work even when all APIs fail
  console.warn("[NOBITEX] All APIs failed, using hardcoded fallback rate")
  return NextResponse.json({
    stats: {
      "btc-rls": {
        latest: "0", // Will trigger fallback calculation in client
      },
    },
    fallbackRate: FALLBACK_USD_TO_IRT,
    fallback: true,
  })
}
