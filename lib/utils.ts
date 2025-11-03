import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Purchase, Metrics, Quote } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMetrics(
  purchases: Purchase[],
  currentBTCPrice: number,
  currentBTCPriceIRT: number,
): Metrics {
  let totalBTC = 0
  for (const p of purchases) {
    totalBTC += p.btcAmount
  }
  totalBTC = Number.parseFloat(totalBTC.toFixed(8))

  const totalInvested = purchases.reduce((sum, p) => sum + p.totalUsdSpent, 0)
  const currentValue = totalBTC * currentBTCPrice
  const currentValueIRT = totalBTC * currentBTCPriceIRT
  const profitLoss = currentValue - totalInvested
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0
  const averageBuyPrice = totalBTC > 0 ? totalInvested / totalBTC : 0

  return {
    totalBTC,
    totalInvested,
    currentValue,
    currentValueIRT,
    profitLoss,
    profitLossPercent,
    averageBuyPrice,
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }

  if (currency === "IRT") {
    options.currencyDisplay = "name"
  }

  return new Intl.NumberFormat("fa-IR", options)
    .format(amount)
    .replace("US$", "$")
}

export function formatBTC(amount: number): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num)
}

export function getDailyQuote(quotes: Quote[]): Quote {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % quotes.length
  return quotes[index]
}
