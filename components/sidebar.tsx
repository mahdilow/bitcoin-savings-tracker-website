"use client"

import { useState } from "react"
import { TrendingUp, ShoppingCart, BarChart3, Trophy, Settings, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    id: "dca",
    label: "میانگین هزینه دلاری",
    icon: TrendingUp,
    description: "DCA",
  },
  {
    id: "buy",
    label: "خرید بیت‌کوین",
    icon: ShoppingCart,
    description: "Buy Bitcoin",
  },
  {
    id: "statistics",
    label: "آمار و ارقام",
    icon: BarChart3,
    description: "Statistics",
  },
  {
    id: "news",
    label: "اخبار بیتکوین",
    icon: Newspaper,
    description: "News",
  },
  {
    id: "achievements",
    label: "دستاوردها",
    icon: Trophy,
    description: "Achievements",
  },
  {
    id: "settings",
    label: "تنظیمات",
    icon: Settings,
    description: "Settings",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed right-0 top-0 h-screen bg-card border-l border-border z-40 transition-all duration-300 ease-in-out",
          "flex flex-col",
          "translate-x-full w-64",
          "md:translate-x-0",
          isHovered ? "md:w-64" : "md:w-[72px]",
          className,
        )}
      >
        <button
          onClick={() => {
            setActiveItem(null)
            window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))
          }}
          className={cn(
            "p-6 border-b border-border min-h-[88px] flex items-center justify-center transition-all duration-200",
            "hover:bg-primary/10",
            activeItem === null && "bg-primary/10",
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                "transition-all duration-300 overflow-hidden flex items-center",
                isHovered ? "md:opacity-100 md:w-auto" : "md:opacity-100 md:w-auto",
              )}
            >
              <Image
                src="/oryn-logo.png"
                alt="Oryn"
                width={isHovered ? 120 : 40}
                height={isHovered ? 60 : 40}
                className={cn("transition-all duration-300 object-contain", isHovered ? "md:w-[120px]" : "md:w-[40px]")}
                priority
              />
            </div>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
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
                  "w-full flex items-center gap-3 rounded-lg transition-all duration-200",
                  isHovered ? "px-4 py-3" : "md:px-3 md:py-3 md:justify-center px-4 py-3",
                  "hover:bg-primary/10 hover:text-primary group",
                  isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0",
                    isActive && "text-primary",
                  )}
                />
                <div
                  className={cn(
                    "flex-1 text-right transition-all duration-300 overflow-hidden",
                    isHovered ? "md:opacity-100 md:w-auto" : "md:opacity-0 md:w-0",
                  )}
                >
                  <div className={cn("font-medium text-sm whitespace-nowrap", isActive && "text-primary")}>
                    {item.label}
                  </div>
                  <div className="text-xs opacity-60 whitespace-nowrap">{item.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Theme Toggle Removed */}

        <div
          className={cn(
            "p-4 border-t border-border transition-all duration-300 overflow-hidden",
            isHovered ? "md:opacity-100" : "md:opacity-0 md:h-0 md:p-0 md:border-0",
          )}
        >
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Powered by Oryn</p>
            <p className="text-xs font-medium text-primary">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
