"use client"

import { useState } from "react"
import { TrendingUp, ShoppingCart, BarChart3, Trophy, Settings, Menu, X, Bitcoin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const [isOpen, setIsOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-card hover:bg-card/80"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed right-0 top-0 h-screen bg-card border-l border-border z-40 transition-all duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0 w-64" : "translate-x-full w-64",
          "md:translate-x-0",
          isHovered ? "md:w-64" : "md:w-[72px]",
          className,
        )}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-border min-h-[88px] flex items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bitcoin className="w-6 h-6 text-primary" />
            </div>
            <div
              className={cn(
                "transition-all duration-300 overflow-hidden",
                isHovered ? "md:opacity-100 md:w-auto" : "md:opacity-0 md:w-0",
              )}
            >
              <h2 className="font-bold text-lg text-foreground whitespace-nowrap">بیت‌کوین تریکر</h2>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Bitcoin Tracker</p>
            </div>
          </div>
        </div>

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
                  setIsOpen(false)
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

        {/* Footer */}
        <div
          className={cn(
            "p-4 border-t border-border transition-all duration-300 overflow-hidden",
            isHovered ? "md:opacity-100" : "md:opacity-0 md:h-0 md:p-0 md:border-0",
          )}
        >
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">نسخه آزمایشی</p>
            <p className="text-xs font-medium text-primary">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
