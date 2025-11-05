import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Purchase, Metrics, Quote } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMetrics(purchases: Purchase[], currentBTCPrice: number, currentBTCPriceIRT: number): Metrics {
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

  return new Intl.NumberFormat("fa-IR", options).format(amount).replace("US$", "$")
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

export function formatPersianNumber(num: number | string): string {
  const numStr = typeof num === "number" ? num.toString() : num
  return numStr.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number.parseInt(d)])
}

export function toJalali(gregorianDate: string): string {
  const date = new Date(gregorianDate)

  // Simple Jalali conversion algorithm
  let gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()

  let jy: number, jm: number, jd: number

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

  if (gy > 1600) {
    jy = 979
    gy -= 1600
  } else {
    jy = 0
    gy -= 621
  }

  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461

  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }

  if (days < 186) {
    jm = 1 + Math.floor(days / 31)
    jd = 1 + (days % 31)
  } else {
    jm = 7 + Math.floor((days - 186) / 30)
    jd = 1 + ((days - 186) % 30)
  }

  return `${jy}/${jm.toString().padStart(2, "0")}/${jd.toString().padStart(2, "0")}`
}

export function getDailyQuote(quotes: Quote[]): Quote {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % quotes.length
  return quotes[index]
}
