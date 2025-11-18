"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Calendar,
  Award,
  PieChart,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useChartColors } from "@/lib/hooks";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { Purchase } from "@/lib/types";
import { formatPersianNumber, toJalali } from "@/lib/utils";
import { apiCache, CACHE_DURATIONS } from "@/lib/api-cache";

interface StatisticsPageProps {
  purchases: Purchase[];
  currentBTCPrice: number;
  currentBTCPriceIRT: number;
}

interface BitcoinMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  circulatingSupply: number;
  totalSupply: number;
  ath: number;
  atl: number;
  athDate: string;
  atlDate: string;
  dominance: number;
}

interface PriceHistoryData {
  date: string;
  price: number;
}

export function StatisticsPage({
  purchases,
  currentBTCPrice,
  currentBTCPriceIRT,
}: StatisticsPageProps) {
  const { theme } = useTheme();
  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "365">("30");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    dateJalali: string;
    count: number;
    purchases: Purchase[];
    x: number;
    y: number;
  } | null>(null);
  const chartColors = useChartColors();

  // Fetch Bitcoin market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const cacheKey = "btc_market_data";
        const cached = apiCache.get<BitcoinMarketData>(cacheKey);

        if (cached) {
          setMarketData(cached);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false"
        );
        const data = await response.json();

        const circulatingSupply = data.market_data.circulating_supply;
        const maxSupply = 21000000; // Bitcoin's max supply
        const supplyPercentage = (circulatingSupply / maxSupply) * 100;

        const athDate = new Date(data.market_data.ath_date.usd);
        const atlDate = new Date(data.market_data.atl_date.usd);

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
          athDate: toJalali(athDate.toISOString()),
          atlDate: toJalali(atlDate.toISOString()),
          dominance: data.market_data.price_change_percentage_24h,
        };

        apiCache.set(cacheKey, marketDataResult, CACHE_DURATIONS.MARKET_DATA);
        setMarketData(marketDataResult);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Fetch price history
  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const cacheKey = `btc_price_history_${timeRange}`;
        const cached = apiCache.get<PriceHistoryData[]>(cacheKey);

        if (cached) {
          setPriceHistory(cached);
          return;
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${timeRange}`
        );
        const data = await response.json();

        const formattedData = data.prices.map(
          ([timestamp, price]: [number, number]) => ({
            date: new Date(timestamp).toLocaleDateString("fa-IR"),
            price: Math.round(price),
          })
        );

        apiCache.set(cacheKey, formattedData, CACHE_DURATIONS.PRICE_HISTORY);
        setPriceHistory(formattedData);
      } catch (error) {
        console.error("Failed to fetch price history:", error);
      }
    };

    fetchPriceHistory();
  }, [timeRange]);

  const userStats = calculateUserStatistics(
    purchases,
    currentBTCPrice,
    priceHistory
  );

  if (isLoading || !chartColors.positive) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
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
                $
                {formatPersianNumber(marketData?.price.toLocaleString() || "0")}
              </div>
              <div
                className={cn(
                  "text-sm flex items-center gap-1 mt-1",
                  (marketData?.priceChange24h || 0) >= 0
                    ? "text-success"
                    : "text-destructive"
                )}
              >
                {(marketData?.priceChange24h || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPersianNumber(
                  Math.abs(marketData?.priceChange24h || 0).toFixed(2)
                )}
                %
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>ارزش بازار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                $
                {formatPersianNumber(
                  ((marketData?.marketCap || 0) / 1e12).toFixed(2)
                )}
                T
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                تریلیون دلار
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>حجم ۲۴ ساعته</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                $
                {formatPersianNumber(
                  ((marketData?.volume24h || 0) / 1e9).toFixed(2)
                )}
                B
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                میلیارد دلار
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription>تغییرات ۲۴ ساعته</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-xl font-bold",
                  (marketData?.dominance || 0) >= 0
                    ? "text-success"
                    : "text-destructive"
                )}
              >
                <div className="flex items-center gap-1">
                  {(marketData?.dominance || 0) >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {formatPersianNumber(
                    Math.abs(marketData?.dominance || 0).toFixed(2)
                  )}
                  %
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">از دیروز</div>
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
              <Tabs
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as any)}
                className="w-auto"
              >
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
                    $
                    {formatPersianNumber(
                      marketData?.price.toLocaleString() || "0"
                    )}
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
                        ? "text-success"
                        : "text-destructive"
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
                          : marketData?.priceChange30d || 0
                      ).toFixed(2)
                    )}
                    %
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={priceHistory}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="priceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F7931A"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="50%"
                          stopColor="#F7931A"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#F7931A"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      opacity={0.7}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      interval="preserveStartEnd"
                      minTickGap={50}
                    />
                    <YAxis
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                      domain={["dataMin - 1000", "dataMax + 1000"]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              {data.date}
                            </p>
                            <p className="text-lg font-bold text-success">
                              $
                              {formatPersianNumber(data.price.toLocaleString())}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#F7931A"
                      fill="url(#priceGradient)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "#F7931A",
                        stroke: "var(--background)",
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
          <Card className="bg-gradient-to-br from-success/10 to-transparent">
            <CardHeader>
              <CardDescription>بالاترین قیمت تاریخ</CardDescription>
              <CardTitle className="text-2xl text-success">
                ${formatPersianNumber(marketData?.ath.toLocaleString() || "0")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {marketData?.athDate || ""}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-transparent">
            <CardHeader>
              <CardDescription>پایین‌ترین قیمت تاریخ</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                ${formatPersianNumber(marketData?.atl.toFixed(2) || "0")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {marketData?.atlDate || ""}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardDescription>عرضه در گردش</CardDescription>
              <CardTitle className="text-2xl">
                {formatPersianNumber(
                  (marketData?.circulatingSupply || 0).toFixed(0)
                )}{" "}
                BTC
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-success/10 to-transparent">
              <CardHeader>
                <CardTitle>بازده کل</CardTitle>
                <CardDescription>سود/زیان مطلق</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-3xl font-bold",
                    userStats.totalReturn >= 0
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  $
                  {formatPersianNumber(
                    Math.abs(userStats.totalReturn).toLocaleString()
                  )}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-2",
                    userStats.totalReturnPercent >= 0
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {userStats.totalReturnPercent >= 0 ? "+" : ""}
                  {formatPersianNumber(userStats.totalReturnPercent.toFixed(2))}
                  %
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-3/10 to-transparent">
              <CardHeader>
                <CardTitle>بازده سالانه (CAGR)</CardTitle>
                <CardDescription>نرخ رشد سالانه ترکیبی</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-3xl font-bold",
                    userStats.cagr >= 0 ? "text-chart-3" : "text-destructive"
                  )}
                >
                  {formatPersianNumber(userStats.cagr.toFixed(2))}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  در {formatPersianNumber(userStats.investmentDays)} روز
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-5/10 to-transparent">
              <CardHeader>
                <CardTitle>همبستگی با BTC</CardTitle>
                <CardDescription>میزان همخوانی با بازار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-5">
                  {formatPersianNumber(userStats.correlationScore.toFixed(2))}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {userStats.correlationScore > 0.8
                    ? "همبستگی بالا"
                    : userStats.correlationScore > 0.5
                    ? "همبستگی متوسط"
                    : "همبستگی پایین"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>مقایسه پرتفوی با قیمت BTC</CardTitle>
              <CardDescription>
                عملکرد سرمایه‌گذاری شما در مقابل قیمت بیت‌کوین
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart
                    data={userStats.portfolioVsBTC}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="investedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      opacity={0.7}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={10}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {payload[0].payload.date}
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs">قیمت بیتکوین</span>
                                <span className="text-sm font-bold text-primary">
                                  $
                                  {formatPersianNumber(
                                    payload[1].value?.toLocaleString() || "0"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs">ارزش پرتفوی شما</span>
                                <span className="text-sm font-bold text-success">
                                  $
                                  {formatPersianNumber(
                                    payload[0]?.value?.toLocaleString() || "0"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="portfolioValue"
                      name="ارزش پرتفوی"
                      stroke="#10B981"
                      fill="url(#investedGradient)"
                      strokeWidth={2.5}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="btcPrice"
                      name="قیمت BTC"
                      stroke="#F7931A"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <CardTitle>مقایسه با استراتژی خرید و نگهداری</CardTitle>
              </div>
              <CardDescription>
                اگر در اولین خرید تمام سرمایه را یکجا سرمایه‌گذاری می‌کردید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    استراتژی DCA (فعلی شما)
                  </p>
                  <div className="text-2xl font-bold text-primary mb-1">
                    $
                    {formatPersianNumber(
                      userStats.currentPortfolioValue.toLocaleString()
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      userStats.totalReturnPercent >= 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {userStats.totalReturnPercent >= 0 ? "+" : ""}
                    {formatPersianNumber(
                      userStats.totalReturnPercent.toFixed(2)
                    )}
                    % بازده
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    خرید یکجا (بنچمارک)
                  </p>
                  <div className="text-2xl font-bold text-warning mb-1">
                    $
                    {formatPersianNumber(
                      userStats.holdStrategyValue.toLocaleString()
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      userStats.holdStrategyReturn >= 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {userStats.holdStrategyReturn >= 0 ? "+" : ""}
                    {formatPersianNumber(
                      userStats.holdStrategyReturn.toFixed(2)
                    )}
                    % بازده
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-background/50 rounded-lg">
                <p className="text-sm">
                  {userStats.totalReturnPercent >
                  userStats.holdStrategyReturn ? (
                    <span className="text-success font-semibold">
                      ✓ استراتژی DCA شما بهتر عمل کرده است!
                    </span>
                  ) : (
                    <span className="text-warning font-semibold">
                      → خرید یکجا بازده بهتری داشت
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardDescription>تعداد خریدها</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatPersianNumber(userStats.totalPurchases)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">تراکنش</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <CardDescription>میانگین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  $
                  {formatPersianNumber(
                    userStats.averagePurchaseSize.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  هر تراکنش
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <CardDescription>فرکانس خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatPersianNumber(userStats.purchaseFrequency.toFixed(1))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  روز بین خریدها
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardDescription>BTC انباشته</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatPersianNumber(userStats.cumulativeBTC.toFixed(8))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  بیت‌کوین
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>نقشه حرارتی فعالیت</CardTitle>
              <CardDescription>الگوی خرید شما در یک سال گذشته</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto relative">
                <div className="grid grid-cols-52 gap-1 min-w-[700px]">
                  {userStats.activityHeatmap.map((week, weekIndex) => (
                    <div key={weekIndex} className="space-y-1">
                      {week.map((day, dayIndex) => {
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={cn(
                              "w-2.5 h-2.5 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:scale-125 relative",
                              day.count === 0 && "bg-muted/30",
                              day.count === 1 && "bg-primary/30",
                              day.count === 2 && "bg-primary/50",
                              day.count === 3 && "bg-primary/70",
                              day.count >= 4 && "bg-primary"
                            )}
                            onMouseEnter={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setHoveredDay({
                                ...day,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {hoveredDay && (
                  <div
                    className="fixed z-[100] pointer-events-none"
                    style={{
                      left: `${hoveredDay.x}px`,
                      top: `${hoveredDay.y - 10}px`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 space-y-2 min-w-[180px] backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
                        <p className="text-xs text-muted-foreground font-medium">
                          تاریخ
                        </p>
                        <p className="text-xs font-semibold">
                          {hoveredDay.dateJalali}
                        </p>
                      </div>

                      {hoveredDay.count === 0 ? (
                        <div className="py-2">
                          <p className="text-sm text-muted-foreground text-center">
                            خریدی انجام نشده
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                              تعداد خرید
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPersianNumber(hoveredDay.count)} خرید
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                              مجموع BTC
                            </p>
                            <p className="text-sm font-semibold">
                              {formatPersianNumber(
                                hoveredDay.purchases
                                  .reduce((sum, p) => sum + p.btcAmount, 0)
                                  .toFixed(8)
                              )}{" "}
                              BTC
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                              مجموع سرمایه
                            </p>
                            <p className="text-sm font-semibold text-success">
                              $
                              {formatPersianNumber(
                                hoveredDay.purchases
                                  .reduce((sum, p) => sum + p.totalUsdSpent, 0)
                                  .toLocaleString()
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>یک سال پیش</span>
                <div className="flex items-center gap-2">
                  <span>کمتر</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted/30" />
                    <div className="w-3 h-3 rounded-sm bg-primary/30" />
                    <div className="w-3 h-3 rounded-sm bg-primary/50" />
                    <div className="w-3 h-3 rounded-sm bg-primary/70" />
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                  </div>
                  <span>بیشتر</span>
                </div>
                <span>امروز</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>عملکرد ماهانه</CardTitle>
              <CardDescription>سود/زیان درصدی در هر ماه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={userStats.monthlyPerformance}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="positiveGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                      <linearGradient
                        id="negativeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#EF4444"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#EF4444"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      opacity={0.7}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      label={{
                        value: "سود/زیان (%)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: chartColors.text,
                          fontSize: 12,
                        },
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const isProfit = data.profitLossPercent >= 0;
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              {data.month}
                            </p>
                            <div className="flex items-center gap-2">
                              {isProfit ? (
                                <TrendingUp className="w-4 h-4 text-success" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-destructive" />
                              )}
                              <span
                                className={cn(
                                  "text-xl font-bold",
                                  isProfit ? "text-success" : "text-destructive"
                                )}
                              >
                                {isProfit ? "+" : ""}
                                {formatPersianNumber(
                                  Math.abs(data.profitLossPercent).toFixed(2)
                                )}
                                %
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                              <div className="flex justify-between gap-4">
                                <span>سرمایه‌گذاری:</span>
                                <span className="font-medium">
                                  $
                                  {formatPersianNumber(
                                    data.invested?.toLocaleString() || "0"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>ارزش فعلی:</span>
                                <span className="font-medium">
                                  $
                                  {formatPersianNumber(
                                    data.currentValue?.toLocaleString() || "0"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t border-border/30">
                                <span className="font-medium">
                                  {isProfit ? "سود" : "زیان"} مطلق:
                                </span>
                                <span
                                  className={cn(
                                    "font-semibold",
                                    isProfit
                                      ? "text-success"
                                      : "text-destructive"
                                  )}
                                >
                                  {isProfit ? "+" : ""}$
                                  {formatPersianNumber(
                                    Math.abs(data.profitLoss).toFixed(2)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="profitLossPercent"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        if (!payload || payload.profitLossPercent === undefined)
                          return null;
                        const value = payload.profitLossPercent;
                        const fill =
                          value >= 0
                            ? "url(#positiveGradient)"
                            : "url(#negativeGradient)";
                        const adjustedY = value >= 0 ? y : y + height;
                        const adjustedHeight = Math.abs(height);
                        return (
                          <rect
                            x={x}
                            y={adjustedY}
                            width={width}
                            height={adjustedHeight}
                            fill={fill}
                            rx={6}
                            ry={6}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-success/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-success" />
                  <CardTitle>بهترین ماه</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success mb-1">
                  {userStats.bestMonth.month}
                </div>
                <div className="text-xl font-semibold text-success">
                  +
                  {formatPersianNumber(
                    userStats.bestMonth.profitLossPercent.toFixed(2)
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  (+$
                  {formatPersianNumber(
                    userStats.bestMonth.profitLoss.toFixed(2)
                  )}
                  )
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  <CardTitle>بدترین ماه</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive mb-1">
                  {userStats.worstMonth.month}
                </div>
                <div className="text-xl font-semibold text-destructive">
                  {formatPersianNumber(
                    userStats.worstMonth.profitLossPercent.toFixed(2)
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  ($
                  {formatPersianNumber(
                    Math.abs(userStats.worstMonth.profitLoss).toFixed(2)
                  )}
                  )
                </div>
              </CardContent>
            </Card>
          </div>

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
                  $
                  {formatPersianNumber(
                    userStats.averagePurchasePrice.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  قیمت میانگین
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-success" />
                  <CardDescription>بهترین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-success">
                  $
                  {formatPersianNumber(
                    userStats.bestPurchasePrice.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  کمترین قیمت
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <CardDescription>بدترین خرید</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  $
                  {formatPersianNumber(
                    userStats.worstPurchasePrice.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  بیشترین قیمت
                </div>
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
                <div className="text-xl font-bold">
                  {formatPersianNumber(purchases.length)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">تراکنش</div>
              </CardContent>
            </Card>
          </div>

          {/* ROI and Break-even cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle>بازده سرمایه (ROI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={cn(
                        "text-3xl font-bold",
                        userStats.roi >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatPersianNumber(userStats.roi.toFixed(2))}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      درصد سود کل
                    </p>
                  </div>
                  {userStats.roi >= 0 ? (
                    <TrendingUp className="w-12 h-12 text-success opacity-50" />
                  ) : (
                    <TrendingDown className="w-12 h-12 text-destructive opacity-50" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-3/10 to-transparent">
              <CardHeader>
                <CardTitle>قیمت سربه‌سر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-chart-3">
                      $
                      {formatPersianNumber(
                        userStats.breakEvenPrice.toLocaleString()
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentBTCPrice >= userStats.breakEvenPrice
                        ? "در سود هستید"
                        : "در ضرر هستید"}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-chart-3 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle>تحلیل خریدها</CardTitle>
              <CardDescription>
                سود/زیان هر خرید نسبت به قیمت فعلی
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={userStats.purchaseAnalysis}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="positiveGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                      <linearGradient
                        id="negativeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#EF4444"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#EF4444"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      opacity={0.7}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const isProfit = data.profitLossPercent >= 0;
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2 min-w-[200px]">
                            <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
                              <p className="text-xs text-muted-foreground font-medium">
                                تاریخ خرید
                              </p>
                              <p className="text-xs font-semibold">
                                {data.date}
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">
                                  قیمت خرید
                                </p>
                                <p className="text-sm font-semibold">
                                  $
                                  {formatPersianNumber(
                                    data.purchasePrice.toLocaleString()
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">
                                  قیمت فعلی
                                </p>
                                <p className="text-sm font-semibold">
                                  $
                                  {formatPersianNumber(
                                    currentBTCPrice.toLocaleString()
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground font-medium">
                                  {isProfit ? "سود" : "زیان"}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {isProfit ? (
                                    <TrendingUp className="w-4 h-4 text-success" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-destructive" />
                                  )}
                                  <p
                                    className={cn(
                                      "text-lg font-bold",
                                      isProfit
                                        ? "text-success"
                                        : "text-destructive"
                                    )}
                                  >
                                    {isProfit ? "+" : ""}
                                    {formatPersianNumber(
                                      Math.abs(data.profitLossPercent).toFixed(
                                        2
                                      )
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="profitLossPercent"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        if (
                          !payload ||
                          payload.profitLossPercent === undefined
                        ) {
                          return null;
                        }
                        const value = payload.profitLossPercent;
                        const fill =
                          value >= 0
                            ? "url(#positiveGradient)"
                            : "url(#negativeGradient)";

                        // We need to adjust y to start from the 0 line and make height positive
                        const adjustedY = value >= 0 ? y : y + height;
                        const adjustedHeight = Math.abs(height);

                        return (
                          <rect
                            x={x}
                            y={adjustedY}
                            width={width}
                            height={adjustedHeight}
                            fill={fill}
                            rx={6}
                            ry={6}
                          />
                        );
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
                  <BarChart
                    data={userStats.monthlyInvestment}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="investedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      opacity={0.7}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke={chartColors.text}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 space-y-2 min-w-[180px]">
                            <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
                              <p className="text-xs text-muted-foreground font-medium">
                                ماه
                              </p>
                              <p className="text-xs font-semibold">
                                {data.month}
                              </p>
                            </div>
                            <div className="pt-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                مجموع سرمایه‌گذاری
                              </p>
                              <p className="text-xl font-bold text-primary">
                                $
                                {formatPersianNumber(
                                  data.amount.toLocaleString()
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#investedGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function calculateUserStatistics(
  purchases: Purchase[],
  currentBTCPrice: number,
  priceHistory: PriceHistoryData[]
) {
  if (purchases.length === 0) {
    return {
      averagePurchasePrice: 0,
      bestPurchasePrice: 0,
      worstPurchasePrice: 0,
      roi: 0,
      breakEvenPrice: 0,
      purchaseAnalysis: [],
      monthlyInvestment: [],
      totalReturn: 0,
      totalReturnPercent: 0,
      cagr: 0,
      investmentDays: 0,
      correlationScore: 0,
      portfolioVsBTC: [],
      holdStrategyValue: 0,
      holdStrategyReturn: 0,
      currentPortfolioValue: 0,
      totalPurchases: 0,
      averagePurchaseSize: 0,
      purchaseFrequency: 0,
      cumulativeBTC: 0,
      activityHeatmap: [],
      monthlyPerformance: [],
      bestMonth: {
        month: "",
        profitLossPercent: 0,
        profitLoss: 0,
        invested: 0,
        currentValue: 0,
        btc: 0,
      },
      worstMonth: {
        month: "",
        profitLossPercent: 0,
        profitLoss: 0,
        invested: 0,
        currentValue: 0,
        btc: 0,
      },
    };
  }

  const totalInvested = purchases.reduce((sum, p) => sum + p.totalUsdSpent, 0);
  const totalBTC = purchases.reduce((sum, p) => sum + p.btcAmount, 0);
  const currentValue = totalBTC * currentBTCPrice;
  const averagePurchasePrice = totalInvested / totalBTC;

  const prices = purchases.map((p) => p.usdPriceAtPurchase);
  const bestPurchasePrice = Math.min(...prices);
  const worstPurchasePrice = Math.max(...prices);

  const totalReturn = currentValue - totalInvested;
  const totalReturnPercent = (totalReturn / totalInvested) * 100;
  const roi = totalReturnPercent;
  const breakEvenPrice = averagePurchasePrice;

  // Calculate CAGR
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstPurchaseDate = new Date(sortedPurchases[0].date);
  const today = new Date();
  const investmentDays = Math.max(
    1,
    Math.floor(
      (today.getTime() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const years = investmentDays / 365;
  const cagr =
    years > 0
      ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
      : 0;

  // Portfolio vs BTC overlay data
  const portfolioVsBTC: Array<{
    date: string;
    portfolioValue: number;
    btcPrice: number;
  }> = [];
  sortedPurchases.forEach((purchase, index) => {
    const purchaseDate = new Date(purchase.date);
    const cumulativeBTC = sortedPurchases
      .slice(0, index + 1)
      .reduce((sum, p) => sum + p.btcAmount, 0);
    portfolioVsBTC.push({
      date: toJalali(purchase.date),
      portfolioValue: cumulativeBTC * currentBTCPrice,
      btcPrice: purchase.usdPriceAtPurchase,
    });
  });

  // Correlation score (simplified - comparing portfolio growth vs BTC price trend)
  const portfolioGrowth = portfolioVsBTC.map((d) => d.portfolioValue);
  const btcPrices = portfolioVsBTC.map((d) => d.btcPrice);
  const correlationScore = calculateCorrelation(portfolioGrowth, btcPrices);

  // Hold strategy benchmark
  const firstPurchase = sortedPurchases[0];
  const holdStrategyBTC = totalInvested / firstPurchase.usdPriceAtPurchase;
  const holdStrategyValue = holdStrategyBTC * currentBTCPrice;
  const holdStrategyReturn =
    ((holdStrategyValue - totalInvested) / totalInvested) * 100;

  // Activity metrics
  const totalPurchases = purchases.length;
  const averagePurchaseSize = totalInvested / totalPurchases;
  const purchaseFrequency =
    totalPurchases > 0 && investmentDays > 0
      ? investmentDays / totalPurchases
      : 0;
  const cumulativeBTC = totalBTC;

  // Activity heatmap (52 weeks x 7 days = 364 days ~ 1 year)
  const activityHeatmap: Array<
    Array<{
      date: string;
      dateJalali: string;
      count: number;
      purchases: Purchase[];
    }>
  > = [];
  const todayHeatmap = new Date();

  // Group purchases by date
  const purchasesByDate = new Map<string, Purchase[]>();
  purchases.forEach((p) => {
    const dateStr = p.date.split("T")[0];
    const existing = purchasesByDate.get(dateStr) || [];
    existing.push(p);
    purchasesByDate.set(dateStr, existing);
  });

  for (let week = 0; week < 52; week++) {
    const weekData: Array<{
      date: string;
      dateJalali: string;
      count: number;
      purchases: Purchase[];
    }> = [];
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      const date = new Date(todayHeatmap);
      date.setDate(date.getDate() - (364 - dayIndex));
      const dateStr = date.toISOString().split("T")[0];
      const dayPurchases = purchasesByDate.get(dateStr) || [];
      const count = dayPurchases.length;
      weekData.push({
        date: dateStr,
        dateJalali: toJalali(dateStr),
        count,
        purchases: dayPurchases,
      });
    }
    activityHeatmap.push(weekData);
  }

  // Monthly performance - calculate profit/loss for purchases made in each month
  const monthlyPerformanceMap = new Map<
    string,
    { invested: number; btc: number }
  >();
  sortedPurchases.forEach((p) => {
    const jalaliDate = toJalali(p.date);
    const monthKey = jalaliDate.substring(0, 7); // Get YYYY/MM format
    const existing = monthlyPerformanceMap.get(monthKey) || {
      invested: 0,
      btc: 0,
    };
    monthlyPerformanceMap.set(monthKey, {
      invested: existing.invested + p.totalUsdSpent,
      btc: existing.btc + p.btcAmount,
    });
  });

  const monthlyPerformance = Array.from(monthlyPerformanceMap.entries())
    .map(([month, data]) => {
      const currentValueOfMonthBTC = data.btc * currentBTCPrice;
      const profitLoss = currentValueOfMonthBTC - data.invested;
      const profitLossPercent =
        data.invested > 0 ? (profitLoss / data.invested) * 100 : 0;

      return {
        month,
        profitLossPercent,
        profitLoss,
        invested: data.invested,
        currentValue: currentValueOfMonthBTC,
        btc: data.btc,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const bestMonth = monthlyPerformance.reduce(
    (best, curr) =>
      curr.profitLossPercent > best.profitLossPercent ? curr : best,
    monthlyPerformance.length > 0
      ? monthlyPerformance[0]
      : {
          month: "",
          profitLossPercent: 0,
          profitLoss: 0,
          invested: 0,
          currentValue: 0,
          btc: 0,
        }
  );
  const worstMonth = monthlyPerformance.reduce(
    (worst, curr) =>
      curr.profitLossPercent < worst.profitLossPercent ? curr : worst,
    monthlyPerformance.length > 0
      ? monthlyPerformance[0]
      : {
          month: "",
          profitLossPercent: 0,
          profitLoss: 0,
          invested: 0,
          currentValue: 0,
          btc: 0,
        }
  );

  // Purchase analysis
  const purchaseAnalysis = purchases
    .map((p) => ({
      date: toJalali(p.date),
      profitLossPercent:
        ((currentBTCPrice - p.usdPriceAtPurchase) / p.usdPriceAtPurchase) * 100,
      purchasePrice: p.usdPriceAtPurchase,
    }))
    .reverse();

  // Monthly investment breakdown
  const monthlyMap = new Map<string, number>();
  purchases.forEach((p) => {
    const jalaliDate = toJalali(p.date);
    const monthKey = jalaliDate.substring(0, 7);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + p.totalUsdSpent);
  });

  const monthlyInvestment = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    averagePurchasePrice,
    bestPurchasePrice,
    worstPurchasePrice,
    roi,
    breakEvenPrice,
    purchaseAnalysis,
    monthlyInvestment,
    totalReturn,
    totalReturnPercent,
    cagr,
    investmentDays,
    correlationScore,
    portfolioVsBTC,
    holdStrategyValue,
    holdStrategyReturn,
    currentPortfolioValue: currentValue,
    totalPurchases,
    averagePurchaseSize,
    purchaseFrequency,
    cumulativeBTC,
    activityHeatmap,
    monthlyPerformance,
    bestMonth,
    worstMonth,
  };
}

// Helper function to calculate correlation
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : Math.abs(numerator / denominator);
}
