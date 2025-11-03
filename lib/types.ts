export interface Purchase {
  id: string
  date: string // ISO format
  btcAmount: number
  usdPriceAtPurchase: number
  totalUsdSpent: number
  notes?: string
}

export interface Quote {
  text: string // Persian text
  author: string // Persian author name
}

export interface Metrics {
  totalBTC: number
  totalInvested: number
  currentValue: number
  currentValueIRT: number
  profitLoss: number
  profitLossPercent: number
  averageBuyPrice: number
}

export interface BitcoinPrice {
  usd: number
  usd_2_h_change: number
}
