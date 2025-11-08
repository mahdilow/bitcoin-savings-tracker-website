import { NextResponse } from "next/server"

// In-memory cache
let cachedData: any = null
let lastFetchTime = 0
const CACHE_DURATION = 60 * 1000 // 60 seconds

export async function POST() {
  const now = Date.now()

  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedData)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch("https://apiv2.nobitex.ir/market/stats?srcCurrency=btc&dstCurrency=rls", {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[NOBITEX_API_ERROR] Status: ${response.status}, Body: ${errorText}`)

      return NextResponse.json(
        { error: "Nobitex API error", status: response.status, details: errorText },
        { status: 500 },
      )
    }

    const data = await response.json()

    if (!data || !data.stats) {
      console.error("[NOBITEX_API_ERROR] Invalid response structure:", data)
      return NextResponse.json({ error: "Invalid Nobitex API response" }, { status: 500 })
    }

    // Update cache
    cachedData = data
    lastFetchTime = now

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[NOBITEX_API_ERROR]", error?.message || error)

    return NextResponse.json(
      {
        error: "Failed to fetch Nobitex data",
        message: error?.message || "Unknown error",
        // Return cached data if available even if stale
        fallbackAvailable: !!cachedData,
      },
      { status: 500 },
    )
  }
}
