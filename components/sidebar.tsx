"use client"

import { useState } from "react"
import { Home, TrendingUp, ShoppingCart, BarChart3, Trophy, Settings, Newspaper } from 'lucide-react'
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: Home,
    description: "Overview",
  },
  {
    id: "buy",
    label: "خرید بیت‌کوین",
    icon: ShoppingCart,
    description: "Buy Bitcoin",
  },
  {
    id: "dca",
    label: "میانگین هزینه دلاری",
    icon: TrendingUp,
    description: "DCA Strategy",
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
    description: "Latest News",
  },
  {
    id: "achievements",
    label: "دستاوردها",
    icon: Trophy,
    description: "Achievements",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>("dashboard")
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed right-0 top-0 h-screen bg-card border-l border-border z-40 transition-all duration-300 ease-in-out",
          "flex flex-col shadow-xl",
          "translate-x-full w-64",
          "md:translate-x-0",
          isHovered ? "md:w-64" : "md:w-[80px]",
          className,
        )}
      >
        <button
          onClick={() => {
            setActiveItem("dashboard")
            window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))
          }}
          className={cn(
            "p-6 border-b border-border min-h-[100px] flex items-center justify-center transition-all duration-200",
            "hover:bg-primary/5 active:bg-primary/10",
            activeItem === "dashboard" && "bg-primary/5",
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
                width={isHovered ? 140 : 48}
                height={isHovered ? 70 : 48}
                className={cn(
                  "transition-all duration-300 object-contain",
                  isHovered ? "md:w-[140px]" : "md:w-[48px]",
                )}
                priority
              />
            </div>
          </div>
        </button>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
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
                  "w-full flex items-center gap-4 rounded-xl transition-all duration-150 ease-out relative group",
                  isHovered ? "px-4 py-3.5 gap-4" : "md:px-2 md:py-3.5 px-4 py-3.5",
                  "hover:bg-primary/10 hover:shadow-sm",
                  isActive
                    ? "bg-primary/15 text-primary shadow-md before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-primary before:rounded-l-full before:shadow-[0_0_8px_rgba(247,147,26,0.5)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-150 ease-out flex-shrink-0",
                    "group-hover:scale-110",
                    isActive && "text-primary drop-shadow-[0_0_4px_rgba(247,147,26,0.3)]",
                    !isHovered && "mx-auto"
                  )}
                />
                <div
                  className={cn(
                    "flex-1 text-right transition-all duration-300 overflow-hidden",
                    isHovered ? "md:opacity-100 md:w-auto" : "md:opacity-0 md:w-0",
                  )}
                >
                  <div
                    className={cn(
                      "font-semibold text-[15px] whitespace-nowrap mb-0.5",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 whitespace-nowrap font-medium">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        <div
          className={cn(
            "border-t border-border transition-all duration-300 overflow-hidden",
            isHovered ? "md:opacity-100 md:h-auto md:p-5" : "md:opacity-0 md:h-0 md:p-0 md:border-0",
            "p-5",
          )}
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Image src="/oryn-logo.png" alt="Oryn" width={24} height={24} className="object-contain" />
              <p className="text-xs font-bold text-primary tracking-wider">ORYN</p>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Powered by Oryn</p>
            <p className="text-[11px] font-semibold text-primary/80 mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
