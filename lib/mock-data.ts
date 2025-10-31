import type { Purchase } from "./types"

export const mockPurchases: Purchase[] = [
  {
    id: "1",
    date: "2024-05-15T10:30:00Z",
    btcAmount: 0.015,
    usdPriceAtPurchase: 62000,
    totalUsdSpent: 930,
    notes: "اولین خرید من",
  },
  {
    id: "2",
    date: "2024-06-20T14:15:00Z",
    btcAmount: 0.008,
    usdPriceAtPurchase: 65000,
    totalUsdSpent: 520,
    notes: "خرید هفتگی",
  },
  {
    id: "3",
    date: "2024-07-10T09:00:00Z",
    btcAmount: 0.012,
    usdPriceAtPurchase: 58000,
    totalUsdSpent: 696,
    notes: "خرید در زمان کاهش قیمت",
  },
  {
    id: "4",
    date: "2024-08-25T16:45:00Z",
    btcAmount: 0.02,
    usdPriceAtPurchase: 64500,
    totalUsdSpent: 1290,
  },
  {
    id: "5",
    date: "2024-09-30T11:20:00Z",
    btcAmount: 0.005,
    usdPriceAtPurchase: 63000,
    totalUsdSpent: 315,
    notes: "سرمایه‌گذاری ماهانه",
  },
  {
    id: "6",
    date: "2024-10-15T13:30:00Z",
    btcAmount: 0.01,
    usdPriceAtPurchase: 67000,
    totalUsdSpent: 670,
  },
]
