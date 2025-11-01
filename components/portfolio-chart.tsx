"use client"

import { Card } from "@/components/ui/card"
import type { Purchase } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { isoToJalali } from "@/lib/jalali-utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface PortfolioChartProps {
  purchases: Purchase[]
  currentBTCPrice: number
}

export function PortfolioChart({ purchases, currentBTCPrice }: PortfolioChartProps) {
  // Sort purchases by date
  const sortedPurchases = [...purchases].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate cumulative portfolio value
  const chartData = sortedPurchases.map((purchase, index) => {
    const previousPurchases = sortedPurchases.slice(0, index + 1)
    const totalBTC = previousPurchases.reduce((sum, p) => sum + p.btcAmount, 0)
    const totalInvested = previousPurchases.reduce((sum, p) => sum + p.totalUsdSpent, 0)
    const valueAtPurchase = totalBTC * purchase.usdPriceAtPurchase

    return {
      date: isoToJalali(purchase.date),
      value: valueAtPurchase,
      invested: totalInvested,
      fullDate: purchase.date,
    }
  })

  // Add current value as final point
  if (sortedPurchases.length > 0) {
    const totalBTC = sortedPurchases.reduce((sum, p) => sum + p.btcAmount, 0)
    const totalInvested = sortedPurchases.reduce((sum, p) => sum + p.totalUsdSpent, 0)
    chartData.push({
      date: "امروز",
      value: totalBTC * currentBTCPrice,
      invested: totalInvested,
      fullDate: new Date().toISOString(),
    })
  }

  if (purchases.length === 0) {
    return null
  }

  return (
    <Card className="p-6 border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">نمودار ارزش پرتفوی</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(247, 147, 26)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(247, 147, 26)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(42, 42, 42)" />
          <XAxis dataKey="date" stroke="rgb(163, 163, 163)" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="rgb(163, 163, 163)"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(26, 26, 26)",
              border: "1px solid rgb(42, 42, 42)",
              borderRadius: "8px",
              direction: "rtl",
            }}
            labelStyle={{ color: "rgb(255, 255, 255)" }}
            formatter={(value: number) => [formatCurrency(value), "ارزش"]}
          />
          <Area type="monotone" dataKey="value" stroke="rgb(247, 147, 26)" strokeWidth={2} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
