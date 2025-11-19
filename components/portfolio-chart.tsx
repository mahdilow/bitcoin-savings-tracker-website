"use client";

import { Card } from "@/components/ui/card";
import type { Purchase } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { isoToJalali } from "@/lib/jalali-utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useChartColors } from "@/lib/hooks";

interface PortfolioChartProps {
  purchases: Purchase[];
  currentBTCPrice: number;
}

export function PortfolioChart({
  purchases,
  currentBTCPrice,
}: PortfolioChartProps) {
  const { theme } = useTheme();
  const chartColors = useChartColors();

  // Sort purchases by date
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate cumulative portfolio value
  const chartData = sortedPurchases.map((purchase, index) => {
    const previousPurchases = sortedPurchases.slice(0, index + 1);
    const totalBTC = previousPurchases.reduce((sum, p) => sum + p.btcAmount, 0);
    const totalInvested = previousPurchases.reduce(
      (sum, p) => sum + p.totalUsdSpent,
      0
    );
    const valueAtPurchase = totalBTC * purchase.usdPriceAtPurchase;

    return {
      date: isoToJalali(purchase.date),
      value: valueAtPurchase,
      invested: totalInvested,
      fullDate: purchase.date,
    };
  });

  // Add current value as final point
  if (sortedPurchases.length > 0) {
    const totalBTC = sortedPurchases.reduce((sum, p) => sum + p.btcAmount, 0);
    const totalInvested = sortedPurchases.reduce(
      (sum, p) => sum + p.totalUsdSpent,
      0
    );
    chartData.push({
      date: "امروز",
      value: totalBTC * currentBTCPrice,
      invested: totalInvested,
      fullDate: new Date().toISOString(),
    });
  }

  if (purchases.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        نمودار ارزش پرتفوی
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} key={theme}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cccccc"
            strokeOpacity={0.7}
          />
          <XAxis dataKey="date" stroke={chartColors.text} fontSize={12} />
          <YAxis
            stroke={chartColors.text}
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const value = payload.find((p) => p.dataKey === "value")
                  ?.value as number;
                const invested = payload.find((p) => p.dataKey === "invested")
                  ?.value as number;
                const profitLoss = value - invested;
                const profitLossPercent = (
                  (profitLoss / invested) *
                  100
                ).toFixed(2);
                const isProfit = profitLoss >= 0;

                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-popover-foreground">
                    <p className="font-bold mb-2">{label}</p>
                    <p className="text-muted-foreground text-sm mb-1">
                      ارزش فعلی: {formatCurrency(value)}
                    </p>
                    <p className="text-muted-foreground text-sm mb-2">
                      سرمایه: {formatCurrency(invested)}
                    </p>
                    <div className="border-t border-border pt-2 mt-1">
                      <p
                        className={`font-bold text-sm ${
                          isProfit ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isProfit ? "سود" : "ضرر"}:{" "}
                        {formatCurrency(Math.abs(profitLoss))} (
                        {profitLossPercent}%)
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ direction: "rtl", paddingTop: "20px" }}
            formatter={(value) =>
              value === "value" ? "ارزش فعلی" : "سرمایه سرمایه‌گذاری شده"
            }
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorInvested)"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F7931A"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
