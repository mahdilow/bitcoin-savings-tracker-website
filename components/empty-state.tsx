"use client"

import { TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAddFirst: () => void
}

export function EmptyState({ onAddFirst }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <TrendingUp className="w-10 h-10 text-primary" />
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">شروع سفر پس‌انداز بیت‌کوین</h3>

      <p className="text-muted-foreground mb-8 max-w-md text-pretty">
        هنوز هیچ خریدی ثبت نکرده‌اید. اولین خرید خود را اضافه کنید و رشد سرمایه‌گذاری خود را دنبال کنید
      </p>

      <Button
        onClick={onAddFirst}
        size="lg"
        className="h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        <Plus className="w-5 h-5 ml-2" />
        افزودن اولین خرید
      </Button>
    </div>
  )
}
