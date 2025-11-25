import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

interface BitcoinData {
  price_usd: number
  price_change_24h: number
  price_change_7d: number
  price_change_30d: number
  market_cap: number
  volume_24h: number
  circulating_supply: number
  total_supply: number
  ath: number
  ath_date: string
  atl: number
  atl_date: string
  dominance: number
  fetched_at: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check for cached data in database (less than 1 hour old)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: cachedData, error: fetchError } = await supabase
      .from("bitcoin_prices")
      .select("*")
      .gte("fetched_at", oneHourAgo)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!fetchError && cachedData) {
      console.log("[v0] Returning cached Bitcoin data from database")
      return NextResponse.json(cachedData)
    }

    // If no valid cache, fetch from external API
    console.log("[v0] Fetching fresh Bitcoin data from API")
    const freshData = await fetchBitcoinData()

    // Store in database
    const { error: insertError } = await supabase.from("bitcoin_prices").insert({
      ...freshData,
      fetched_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("[v0] Failed to cache Bitcoin data:", insertError)
    }

    return NextResponse.json(freshData)
  } catch (error) {
    console.error("[v0] Error in bitcoin-data API:", error)
    return NextResponse.json({ error: "Failed to fetch Bitcoin data" }, { status: 500 })
  }
}

async function fetchBitcoinData(): Promise<BitcoinData> {
  try {
    // Try CoinGecko first
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
    )

    if (!response.ok) throw new Error("CoinGecko API failed")

    const data = await response.json()
    const md = data.market_data

    let atl = md.atl.usd
    let atlDateStr = md.atl_date.usd

    // Fallback to known ATL if API returns incomplete data
    if (atl > 100) {
      atl = 67.81
      atlDateStr = "2013-07-06T00:00:00.000Z"
    }

    const atlDate = new Date(atlDateStr)
    const athDate = new Date(md.ath_date.usd)

    return {
      price_usd: md.current_price.usd,
      price_change_24h: md.price_change_percentage_24h || 0,
      price_change_7d: md.price_change_percentage_7d || 0,
      price_change_30d: md.price_change_percentage_30d || 0,
      market_cap: md.market_cap.usd || 0,
      volume_24h: md.total_volume.usd || 0,
      circulating_supply: md.circulating_supply || 0,
      total_supply: md.total_supply || 21000000,
      ath: md.ath.usd,
      atl: atl,
      ath_date: athDate.toISOString(),
      atl_date: atlDate.toISOString(),
      dominance: md.market_cap_change_percentage_24h || 0,
      fetched_at: new Date().toISOString(),
    }
  } catch (error) {
    console.warn("[v0] CoinGecko failed, trying CoinCap:", error)

    // Try CoinCap second
    try {
      const response = await fetch("https://api.coincap.io/v2/assets/bitcoin")
      if (!response.ok) throw new Error("CoinCap API failed")

      const json = await response.json()
      const data = json.data

      return {
        price_usd: Number.parseFloat(data.priceUsd),
        price_change_24h: Number.parseFloat(data.changePercent24Hr) || 0,
        price_change_7d: 0,
        price_change_30d: 0,
        market_cap: Number.parseFloat(data.marketCapUsd) || 0,
        volume_24h: Number.parseFloat(data.volumeUsd24Hr) || 0,
        circulating_supply: Number.parseFloat(data.supply) || 0,
        total_supply: 21000000,
        ath: 0,
        ath_date: "",
        atl: 67.81,
        atl_date: "2013-07-06T00:00:00.000Z",
        dominance: 0,
        fetched_at: new Date().toISOString(),
      }
    } catch (coinCapError) {
      console.warn("[v0] CoinCap failed, trying Binance:", coinCapError)

      // Fallback to Binance (limited data)
      try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT")
        if (!response.ok) throw new Error("Binance API failed")

        const data = await response.json()

        return {
          price_usd: Number.parseFloat(data.lastPrice),
          price_change_24h: Number.parseFloat(data.priceChangePercent),
          price_change_7d: 0,
          price_change_30d: 0,
          market_cap: 0,
          volume_24h: Number.parseFloat(data.volume) * Number.parseFloat(data.lastPrice),
          circulating_supply: 0,
          total_supply: 21000000,
          ath: 0,
          ath_date: "",
          atl: 67.81,
          atl_date: "2013-07-06T00:00:00.000Z",
          dominance: 0,
          fetched_at: new Date().toISOString(),
        }
      } catch (binanceError) {
        console.error("[v0] All APIs failed:", binanceError)
        throw new Error("Failed to fetch Bitcoin data from all sources")
      }
    }
  }
}
