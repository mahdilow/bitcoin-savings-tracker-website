"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
      aria-label={theme === "dark" ? "تغییر به حالت روز" : "تغییر به حالت شب"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-primary transition-transform hover:rotate-90 duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-primary transition-transform hover:-rotate-12 duration-300" />
      )}
    </Button>
  )
}
