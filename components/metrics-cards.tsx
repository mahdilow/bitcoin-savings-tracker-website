"use client"

import { Card } from "@/components/ui/card"
import { Bitcoin, DollarSign, TrendingUp, Calculator } from "lucide-react"
import type { Metrics } from "@/lib/types"
import { formatCurrency, formatBTC, formatNumber } from "@/lib/utils"

interface MetricsCardsProps {
  metrics: Metrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "کل بیت‌کوین",
      value: `${formatBTC(metrics.totalBTC)} BTC`,
      icon: Bitcoin,
      color: "text-primary",
    },
    {
      title: "کل سرمایه",
      value: formatCurrency(metrics.totalInvested),
      icon: DollarSign,
      color: "text-blue-400",
    },
    {
      title: "ارزش فعلی",
      value: formatCurrency(metrics.currentValue),
      subtitle: `${metrics.profitLoss >= 0 ? "+" : ""}${formatCurrency(metrics.profitLoss)} (${metrics.profitLossPercent >= 0 ? "+" : ""}${formatNumber(metrics.profitLossPercent.toFixed(2))}%)`,
      subtitleColor: metrics.profitLoss >= 0 ? "text-[rgb(var(--success))]" : "text-destructive",
      icon: TrendingUp,
      color: metrics.profitLoss >= 0 ? "text-[rgb(var(--success))]" : "text-destructive",
    },
    {
      title: "میانگین خرید",
      value: formatCurrency(metrics.averageBuyPrice),
      icon: Calculator,
      color: "text-accent",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="p-6 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <card.icon className={`w-5 h-5 ${card.color} group-hover:scale-110 transition-transform`} />
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{card.value}</p>
          {card.subtitle && <p className={`text-sm font-semibold ${card.subtitleColor}`}>{card.subtitle}</p>}
        </Card>
      ))}
    </div>
  )
}
