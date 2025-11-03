import { NextResponse } from "next/server"

// In-memory cache
let cachedData: any = null
let lastFetchTime: number = 0
const CACHE_DURATION = 60 * 1000 // 60 seconds

export async function POST() {
  const now = Date.now()

  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedData)
  }

  try {
    const response = await fetch("https://apiv2.nobitex.ir/market/stats?srcCurrency=btc&dstCurrency=rls")

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Nobitex API responded with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Nobitex API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Update cache
    cachedData = data
    lastFetchTime = now

    return NextResponse.json(data)
  } catch (error) {
    console.error("[NOBITEX_API_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
