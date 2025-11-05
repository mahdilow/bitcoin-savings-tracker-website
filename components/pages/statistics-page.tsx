"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Calendar, Award, PieChart } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"
import type { Purchase } from "@/lib/types"
import { formatPersianNumber, toJalali } from "@/lib/utils"
import { apiCache, CACHE_DURATIONS } from "@/lib/api-cache"

interface StatisticsPageProps {
  purchases: Purchase[]
  currentBTCPrice: number
  currentBTCPriceIRT: number
}

interface BitcoinMarketData {
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  priceChange7d: number
  priceChange30d: number
  circulatingSupply: number
  totalSupply: number
  ath: number
  atl: number
  dominance: number
}

interface PriceHistoryData {
  date: string
  price: number
}

export function StatisticsPage({ purchases, currentBTCPrice, currentBTCPriceIRT }: StatisticsPageProps) {
  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([])
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "365">("30")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch Bitcoin market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true)
        const cacheKey = "btc_market_data"
        const cached = apiCache.get<BitcoinMarketData>(cacheKey)

        if (cached) {
          setMarketData(cached)
          setIsLoading(false)
          return
        }

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
        )
        const data = await response.json()

        const marketDataResult = {
          price: data.market_data.current_price.usd,
          marketCap: data.market_data.market_cap.usd,
          volume24h: data.market_data.total_volume.usd,
          priceChange24h: data.market_data.price_change_percentage_24h,
          priceChange7d: data.market_data.price_change_percentage_7d,
          priceChange30d: data.market_data.price_change_percentage_30d,
          circulatingSupply: data.market_data.circulating_supply,
          totalSupply: data.market_data.total_supply,
          ath: data.market_data.ath.usd,
          atl: data.market_data.atl.usd,
          dominance: data.market_data.market_cap_percentage?.btc || 0,
        }

        apiCache.set(cacheKey, marketDataResult, CACHE_DURATIONS.MARKET_DATA)
        setMarketData(marketDataResult)
      } catch (error) {
        console.error("Failed to fetch market data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarketData()
  }, [])

  // Fetch price history
  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const cacheKey = `btc_price_history_${timeRange}`
        const cached = apiCache.get<PriceHistoryData[]>(cacheKey)

        if (cached) {
          setPriceHistory(cached)
          return
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${timeRange}`,
        )
        const data = await response.json()

        const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
          date: new Date(timestamp).toLocaleDateString("fa-IR"),
          price: Math.round(price),
        }))

        apiCache.set(cacheKey, formattedData, CACHE_DURATIONS.PRICE_HISTORY)
        setPriceHistory(formattedData)
      } catch (error) {
        console.error("Failed to fetch price history:", error)
      }
    }

    fetchPriceHistory()
  }, [timeRange])

  const userStats = calculateUserStatistics(purchases, currentBTCPrice)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bitcoin Market Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">بازار بیت‌کوین</h2>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>قیمت فعلی</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${formatPersianNumber(marketData?.price.toLocaleString() || "0")}
              </div>
              <div
                className={cn(
                  "text-sm flex items-center gap-1 mt-1",
                  (marketData?.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {(marketData?.priceChange24h || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPersianNumber(Math.abs(marketData?.priceChange24h || 0).toFixed(2))}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>ارزش بازار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ${formatPersianNumber(((marketData?.marketCap || 0) / 1e9).toFixed(2))}B
              </div>
              <div className="text-xs text-muted-foreground mt-1">میلیارد دلار</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>حجم ۲۴ ساعته</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ${formatPersianNumber(((marketData?.volume24h || 0) / 1e9).toFixed(2))}B
              </div>
              <div className="text-xs text-muted-foreground mt-1">میلیارد دلار</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>تسلط بازار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                {formatPersianNumber((marketData?.dominance || 0).toFixed(2))}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">سهم از بازار</div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>نمودار قیمت بیت‌کوین</CardTitle>
                <CardDescription className="mt-1">
                  تغییرات قیمت در{" "}
                  {timeRange === "7"
                    ? "۷ روز"
                    : timeRange === "30"
                      ? "۳۰ روز"
                      : timeRange === "90"
                        ? "۹۰ روز"
                        : "یک سال"}{" "}
                  گذشته
                </CardDescription>
              </div>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
                <TabsList className="grid grid-cols-4 w-full md:w-[280px]">
                  <TabsTrigger value="7">۷ روز</TabsTrigger>
                  <TabsTrigger value="30">۳۰ روز</TabsTrigger>
                  <TabsTrigger value="90">۹۰ روز</TabsTrigger>
                  <TabsTrigger value="365">۱ سال</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Price Summary */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">قیمت فعلی</p>
                  <p className="text-2xl font-bold text-primary">
                    ${formatPersianNumber(marketData?.price.toLocaleString() || "0")}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    تغییرات{" "}
                    {timeRange === "7"
                      ? "۷ روز"
                      : timeRange === "30"
                        ? "۳۰ روز"
                        : timeRange === "90"
                          ? "۹۰ روز"
                          : "یک سال"}
                  </p>
                  <div
                    className={cn(
                      "text-xl font-bold flex items-center gap-2 justify-end",
                      (timeRange === "7"
                        ? marketData?.priceChange7d
                        : timeRange === "30"
                          ? marketData?.priceChange30d
                          : marketData?.priceChange30d || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {(timeRange === "7"
                      ? marketData?.priceChange7d
                      : timeRange === "30"
                        ? marketData?.priceChange30d
                        : marketData?.priceChange30d || 0) >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {formatPersianNumber(
                      Math.abs(
                        timeRange === "7"
                          ? marketData?.priceChange7d || 0
                          : timeRange === "30"
                            ? marketData?.priceChange30d || 0
                            : marketData?.priceChange30d || 0,
                      ).toFixed(2),
                    )}
                    %
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradientGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      interval="preserveStartEnd"
                      minTickGap={50}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      domain={["dataMin - 1000", "dataMax + 1000"]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-1">
                            <p className="text-xs text-muted-foreground">{data.date}</p>
                            <p className="text-lg font-bold text-green-500">
                              ${formatPersianNumber(data.price.toLocaleString())}
                            </p>
                          </div>
                        )
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      fill="url(#priceGradientGreen)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "#10b981",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
            <CardHeader>
              <CardDescription>بالاترین قیمت تاریخ</CardDescription>
              <CardTitle className="text-2xl text-green-500">
                ${formatPersianNumber(marketData?.ath.toLocaleString() || "0")}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader>
              <CardDescription>پایین‌ترین قیمت تاریخ</CardDescription>
              <CardTitle className="text-2xl text-red-500">
                ${formatPersianNumber(marketData?.atl.toLocaleString() || "0")}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardDescription>عرضه در گردش</CardDescription>
              <CardTitle className="text-2xl">
                {formatPersianNumber((marketData?.circulatingSupply || 0).toFixed(0))} BTC
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* User Analytics Section */}
      {purchases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">تحلیل پرتفوی شما</h2>
          </div>

          {/* Advanced User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardDescription>میانگین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  ${formatPersianNumber(userStats.averagePurchasePrice.toLocaleString())}
                </div>
                <div className="text-xs text-muted-foreground mt-1">قیمت میانگین</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500" />
                  <CardDescription>بهترین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-500">
                  ${formatPersianNumber(userStats.bestPurchasePrice.toLocaleString())}
                </div>
                <div className="text-xs text-muted-foreground mt-1">کمترین قیمت</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <CardDescription>بدترین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-500">
                  ${formatPersianNumber(userStats.worstPurchasePrice.toLocaleString())}
                </div>
                <div className="text-xs text-muted-foreground mt-1">بیشترین قیمت</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardDescription>تعداد خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatPersianNumber(purchases.length)}</div>
                <div className="text-xs text-muted-foreground mt-1">تراکنش</div>
              </CardContent>
            </Card>
          </div>

          {/* ROI and Break-even */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle>بازده سرمایه (ROI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn("text-3xl font-bold", userStats.roi >= 0 ? "text-green-500" : "text-red-500")}>
                      {formatPersianNumber(userStats.roi.toFixed(2))}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">درصد سود کل</p>
                  </div>
                  {userStats.roi >= 0 ? (
                    <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
                  ) : (
                    <TrendingDown className="w-12 h-12 text-red-500 opacity-50" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardHeader>
                <CardTitle>قیمت سربه‌سر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-500">
                      ${formatPersianNumber(userStats.breakEvenPrice.toLocaleString())}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentBTCPrice >= userStats.breakEvenPrice ? "در سود هستید" : "در ضرر هستید"}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle>تحلیل خریدها</CardTitle>
              <CardDescription>سود/زیان هر خرید نسبت به قیمت فعلی</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userStats.purchaseAnalysis} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0].payload
                        const isProfit = data.profitLossPercent >= 0
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2 min-w-[200px]">
                            <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
                              <p className="text-xs text-muted-foreground font-medium">تاریخ خرید</p>
                              <p className="text-xs font-semibold">{data.date}</p>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">قیمت خرید</p>
                                <p className="text-sm font-semibold">
                                  ${formatPersianNumber(data.purchasePrice.toLocaleString())}
                                </p>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">قیمت فعلی</p>
                                <p className="text-sm font-semibold">
                                  ${formatPersianNumber(currentBTCPrice.toLocaleString())}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground font-medium">{isProfit ? "سود" : "زیان"}</p>
                                <div className="flex items-center gap-1.5">
                                  {isProfit ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <p className={cn("text-lg font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                    {isProfit ? "+" : ""}
                                    {formatPersianNumber(Math.abs(data.profitLossPercent).toFixed(2))}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Bar
                      dataKey="profitLossPercent"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props
                        if (!payload || payload.profitLossPercent === undefined) {
                          return null
                        }
                        const value = payload.profitLossPercent
                        const fill = value >= 0 ? "url(#profitGradient)" : "url(#lossGradient)"

                        // For negative values, adjust y position and make height positive
                        const adjustedY = value >= 0 ? y : y
                        const adjustedHeight = Math.abs(height)

                        return (
                          <rect x={x} y={adjustedY} width={width} height={adjustedHeight} fill={fill} rx={6} ry={6} />
                        )
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Investment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>سرمایه‌گذاری ماهانه</CardTitle>
              <CardDescription>مجموع سرمایه‌گذاری در هر ماه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userStats.monthlyInvestment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2 min-w-[180px]">
                            <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
                              <p className="text-xs text-muted-foreground font-medium">ماه</p>
                              <p className="text-xs font-semibold">{data.month}</p>
                            </div>
                            <div className="pt-1">
                              <p className="text-xs text-muted-foreground mb-1">مجموع سرمایه‌گذاری</p>
                              <p className="text-xl font-bold text-primary">
                                ${formatPersianNumber(data.amount.toLocaleString())}
                              </p>
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="amount" fill="url(#investmentGradient)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function calculateUserStatistics(purchases: Purchase[], currentBTCPrice: number) {
  if (purchases.length === 0) {
    return {
      averagePurchasePrice: 0,
      bestPurchasePrice: 0,
      worstPurchasePrice: 0,
      roi: 0,
      breakEvenPrice: 0,
      purchaseAnalysis: [],
      monthlyInvestment: [],
    }
  }

  const totalInvested = purchases.reduce((sum, p) => sum + p.totalUsdSpent, 0)
  const totalBTC = purchases.reduce((sum, p) => sum + p.btcAmount, 0)
  const currentValue = totalBTC * currentBTCPrice
  const averagePurchasePrice = totalInvested / totalBTC

  const prices = purchases.map((p) => p.usdPriceAtPurchase)
  const bestPurchasePrice = Math.min(...prices)
  const worstPurchasePrice = Math.max(...prices)

  const roi = ((currentValue - totalInvested) / totalInvested) * 100
  const breakEvenPrice = averagePurchasePrice

  // Purchase analysis
  const purchaseAnalysis = purchases
    .map((p) => ({
      date: toJalali(p.date),
      profitLossPercent: ((currentBTCPrice - p.usdPriceAtPurchase) / p.usdPriceAtPurchase) * 100,
      purchasePrice: p.usdPriceAtPurchase,
    }))
    .reverse()

  // Monthly investment breakdown
  const monthlyMap = new Map<string, number>()
  purchases.forEach((p) => {
    const date = new Date(p.date)
    const jalaliDate = toJalali(p.date)
    const monthKey = jalaliDate.substring(0, 7) // YYYY/MM
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + p.totalUsdSpent)
  })

  const monthlyInvestment = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    averagePurchasePrice,
    bestPurchasePrice,
    worstPurchasePrice,
    roi,
    breakEvenPrice,
    purchaseAnalysis,
    monthlyInvestment,
  }
}
