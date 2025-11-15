"use client"

import { Card } from "@/components/ui/card"
import type { Purchase } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { isoToJalali } from "@/lib/jalali-utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts"

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
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="[--grid-stroke:#94a3b8] dark:[--grid-stroke:hsl(var(--border))]"
            stroke="var(--grid-stroke)"
            strokeOpacity={0.7}
          />
          <XAxis dataKey="date" stroke="hsl(var(--foreground))" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="hsl(var(--foreground))"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              direction: "rtl",
              color: "hsl(var(--popover-foreground))",
              boxShadow: "0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -2px hsl(var(--foreground) / 0.1)",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const value = payload.find((p) => p.dataKey === "value")?.value as number
                const invested = payload.find((p) => p.dataKey === "invested")?.value as number
                const profitLoss = value - invested
                const profitLossPercent = ((profitLoss / invested) * 100).toFixed(2)
                const isProfit = profitLoss >= 0

                return (
                  <div
                    style={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "12px",
                      direction: "rtl",
                      boxShadow:
                        "0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -2px hsl(var(--foreground) / 0.1)",
                    }}
                  >
                    <p style={{ color: "hsl(var(--popover-foreground))", marginBottom: "8px", fontWeight: "bold" }}>
                      {label}
                    </p>
                    <p style={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}>
                      ارزش فعلی: {formatCurrency(value)}
                    </p>
                    <p style={{ color: "hsl(var(--muted-foreground))", marginBottom: "8px" }}>
                      سرمایه: {formatCurrency(invested)}
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid hsl(var(--border))",
                        paddingTop: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <p
                        style={{
                          color: isProfit ? "hsl(var(--success))" : "hsl(var(--destructive))",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {isProfit ? "سود" : "ضرر"}: {formatCurrency(Math.abs(profitLoss))} ({profitLossPercent}%)
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            wrapperStyle={{ direction: "rtl", paddingTop: "20px" }}
            formatter={(value) => (value === "value" ? "ارزش فعلی" : "سرمایه سرمایه‌گذاری شده")}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            fill="url(#colorInvested)"
          />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
