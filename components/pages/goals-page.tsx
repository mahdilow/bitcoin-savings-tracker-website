"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/hooks"
import { Plus, Trash2, Check } from "lucide-react"
import type { Purchase } from "@/lib/types"

interface Goal {
  id: string
  type: "btc" | "usd" | "purchases" | "streak"
  target: number
  current: number
  status: "active" | "paused" | "completed"
  createdAt: string
  title: string
}

export function GoalsPage({ purchases }: { purchases: Purchase[] }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Calculate goal progress based on purchases
    if (user && goals.length > 0) {
      const totalBTC = purchases.reduce((sum, p) => sum + p.btcAmount, 0)
      const totalUSD = purchases.reduce((sum, p) => sum + p.totalUsdSpent, 0)
      const purchaseCount = purchases.length

      setGoals((prev) =>
        prev.map((goal) => {
          let current = goal.current
          if (goal.type === "btc") {
            current = totalBTC
          } else if (goal.type === "usd") {
            current = totalUSD
          } else if (goal.type === "purchases") {
            current = purchaseCount
          }
          return { ...goal, current }
        }),
      )
    }
  }, [purchases, user])

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>لازم است وارد شوید</CardTitle>
            <CardDescription>برای دسترسی به بخش اهداف، ابتدا وارد حساب خود شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => (window.location.href = "/auth/login")}>
              ورود به حساب
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const completeGoal = (id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status: "completed" } : g)))
  }

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      type: "btc",
      target: 1,
      current: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      title: "هدف جدید",
    }
    setGoals((prev) => [...prev, newGoal])
    setShowForm(false)
  }

  const getProgressPercent = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100)
  }

  const getGoalLabel = (goal: Goal) => {
    if (goal.type === "btc") return "BTC"
    if (goal.type === "usd") return "USD"
    if (goal.type === "purchases") return "خرید"
    return "روز"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">اهداف شما</h2>
          <p className="text-muted-foreground">اهداف سرمایه‌گذاری خود را تعریف و پیگیری کنید</p>
        </div>
        <Button onClick={addGoal} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          افزودن هدف
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">هنوز هدفی تعریف نکرده‌اید</p>
              <Button onClick={addGoal} variant="outline">
                اولین هدف خود را تعریف کنید
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = getProgressPercent(goal)
            const isCompleted = goal.status === "completed" || progress >= 100

            return (
              <Card key={goal.id} className={isCompleted ? "border-green-500/50 bg-green-500/5" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {isCompleted && <Check className="w-5 h-5 text-green-500" />}
                        {goal.title}
                      </CardTitle>
                      <CardDescription>
                        {goal.target} {getGoalLabel(goal)} •{" "}
                        {goal.type === "btc" ? "BTC" : goal.type === "usd" ? "دلار" : "خریداری"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {goal.current.toFixed(goal.type === "btc" ? 4 : 0)} / {goal.target} {getGoalLabel(goal)}
                      </span>
                      <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {isCompleted && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                        تبریک! این هدف را به انجام رساندید
                      </p>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={() => completeGoal(goal.id)} className="w-full">
                    {isCompleted ? "تکمیل شده" : "علامت‌گذاری به‌عنوان تکمیل‌شده"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
