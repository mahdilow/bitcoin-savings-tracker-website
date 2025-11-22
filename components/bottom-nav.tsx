"use client"

import { useState } from "react"
import { TrendingUp, ShoppingCart, BarChart3, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

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
  {
    id: "account",
    label: "حساب من",
    icon: User,
  },
]

export function BottomNav() {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (id: string) => {
    setActiveItem(id)
    if (id === "account") {
      router.push("/account")
    } else {
      // Dispatch event for other items that might be on the same page
      // Or if we decide to make account a separate page, we should treat all navigation consistently.
      // Assuming other items are sections on the home page for now based on existing code
      // except account which is a new page.
      if (pathname !== "/") {
        router.push(`/?section=${id}`)
      } else {
        window.dispatchEvent(new CustomEvent("navigate", { detail: id }))
      }
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.slice(0, 2).map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px]", // Reduced padding and min-width slightly to fit 5 items
                "active:scale-95",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}

        <button
          onClick={() => {
            setActiveItem(null)
            if (pathname !== "/") {
              router.push("/")
            } else {
              window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))
            }
          }}
          className={cn(
            "flex items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[50px]", // Slightly smaller to make room
            "active:scale-95",
            activeItem === null ? "bg-primary/10" : "active:bg-muted/50",
            "hover:bg-primary/20",
          )}
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <Image src="/oryn-logo.png" alt="Oryn" width={28} height={28} className="object-contain" priority />
          </div>
        </button>

        {menuItems.slice(2).map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px]",
                "active:scale-95",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
