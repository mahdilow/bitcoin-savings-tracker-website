"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, Zap } from "lucide-react"

export function DCAPage({ currentBTCPrice }: { currentBTCPrice: number }) {
  const [amount, setAmount] = useState(100)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly">("monthly")
  const [durationMonths, setDurationMonths] = useState(12)

  const simulationData = useMemo(() => {
    const data = []
    const frequencies = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30,
    }
    const days = frequencies[frequency]
    const monthlyDays = 30

    let btcAccumulated = 0
    let totalInvested = 0
    let totalCost = 0
    let currentPrice = currentBTCPrice * 0.8 // Assume starting 20% lower

    for (let month = 0; month < durationMonths; month++) {
      const purchasesThisMonth = Math.floor(monthlyDays / days)
      for (let i = 0; i < purchasesThisMonth; i++) {
        const btcBought = amount / currentPrice
        btcAccumulated += btcBought
        totalInvested += amount
        totalCost += amount
        currentPrice += currentPrice * 0.008 // Simulate 0.8% price increase per purchase
      }

      data.push({
        month: month + 1,
        invested: Math.round(totalInvested),
        value: Math.round(btcAccumulated * currentPrice),
        btc: Number(btcAccumulated.toFixed(4)),
      })
    }

    return data
  }, [amount, frequency, durationMonths, currentBTCPrice])

  const finalData = simulationData[simulationData.length - 1] || {
    invested: 0,
    value: 0,
    btc: 0,
  }
  const roi = finalData.invested > 0 ? ((finalData.value - finalData.invested) / finalData.invested) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              مبلغ سرمایه‌گذاری
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${amount}</div>
            <p className="text-xs text-muted-foreground mt-1">در هر {frequency}</p>
            <div className="mt-4 space-y-2">
              <Slider value={[amount]} onValueChange={(v) => setAmount(v[0])} min={10} max={1000} step={10} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              فراوانی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{frequency}</div>
            <p className="text-xs text-muted-foreground mt-1">تناوب خریداری</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["daily", "weekly", "biweekly", "monthly"] as const).map((freq) => (
                <Button
                  key={freq}
                  variant={frequency === freq ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFrequency(freq)}
                  className="text-xs"
                >
                  {freq}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              مدت زمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{durationMonths} ماه</div>
            <p className="text-xs text-muted-foreground mt-1">مدت سرمایه‌گذاری</p>
            <div className="mt-4 space-y-2">
              <Slider
                value={[durationMonths]}
                onValueChange={(v) => setDurationMonths(v[0])}
                min={6}
                max={60}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نمودار شبیه‌سازی</CardTitle>
          <CardDescription>پیشگویی رشد سرمایه‌گذاری شما در طول زمان</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#888" name="سرمایه‌گذاری شده" />
              <Line type="monotone" dataKey="value" stroke="#f79a1a" name="ارزش فعلی" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">خلاصه نتایج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">کل سرمایه‌گذاری:</span>
              <span className="font-semibold">${finalData.invested.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ارزش فعلی:</span>
              <span className="font-semibold text-primary">${finalData.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTC جمع‌آوری شده:</span>
              <span className="font-semibold">{finalData.btc} BTC</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">بازدهی (ROI):</span>
              <span className={`font-semibold ${roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نکات مهم DCA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>✓ کاهش تاثیر نوسانات قیمت</p>
            <p>✓ سهولت مدیریت و اجرا</p>
            <p>✓ احساسات را کنترل کنید</p>
            <p>✓ راهی برای ساخت موضع طولانی‌مدت</p>
            <p>✓ مناسب برای سرمایه‌گذاری منظم</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
