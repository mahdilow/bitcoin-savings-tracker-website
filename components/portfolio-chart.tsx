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
              <stop offset="5%" stopColor="rgb(247, 147, 26)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(247, 147, 26)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
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
                      backgroundColor: "rgb(26, 26, 26)",
                      border: "1px solid rgb(42, 42, 42)",
                      borderRadius: "8px",
                      padding: "12px",
                      direction: "rtl",
                    }}
                  >
                    <p style={{ color: "rgb(255, 255, 255)", marginBottom: "8px", fontWeight: "bold" }}>{label}</p>
                    <p style={{ color: "rgb(247, 147, 26)", marginBottom: "4px" }}>
                      ارزش فعلی: {formatCurrency(value)}
                    </p>
                    <p style={{ color: "rgb(59, 130, 246)", marginBottom: "8px" }}>
                      سرمایه: {formatCurrency(invested)}
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid rgb(42, 42, 42)",
                        paddingTop: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <p
                        style={{
                          color: isProfit ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
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
            stroke="rgb(59, 130, 246)"
            strokeWidth={2}
            fill="url(#colorInvested)"
          />
          <Area type="monotone" dataKey="value" stroke="rgb(247, 147, 26)" strokeWidth={2} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
