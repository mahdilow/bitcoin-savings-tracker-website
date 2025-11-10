"use client"

import { useState } from "react"
import { TrendingUp, ShoppingCart, BarChart3, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const menuItems = [
  {
    id: "dca",
    label: "DCA",
    icon: TrendingUp,
  },
  {
    id: "buy",
    label: "خرید",
    icon: ShoppingCart,
  },
  {
    id: "statistics",
    label: "آمار",
    icon: BarChart3,
  },
  {
    id: "achievements",
    label: "دستاوردها",
    icon: Trophy,
  },
]

export function BottomNav() {
  const [activeItem, setActiveItem] = useState<string | null>(null)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.slice(0, 2).map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id)
                window.dispatchEvent(new CustomEvent("navigate", { detail: item.id }))
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                "active:scale-95",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}

        <button
          onClick={() => {
            setActiveItem(null)
            window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))
          }}
          className={cn(
            "flex items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]",
            "active:scale-95",
            activeItem === null ? "bg-primary/10" : "active:bg-muted/50",
            "hover:bg-primary/20", // Added hover styling to match other buttons
          )}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <Image src="/oryn-logo.png" alt="Oryn" width={32} height={32} className="object-contain" priority />
          </div>
        </button>

        {menuItems.slice(2).map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id)
                window.dispatchEvent(new CustomEvent("navigate", { detail: item.id }))
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                "active:scale-95",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
