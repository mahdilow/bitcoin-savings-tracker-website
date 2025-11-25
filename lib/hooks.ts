"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useChartColors() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartColors, setChartColors] = useState({
    value: "#F7931A",
    invested: "#10B981",
    grid: "#cccccc",
    text: theme === "dark" ? "#ffffff" : "#000000",
    positive: "#F7931A",
    negative: "#EF4444",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    setChartColors({
      value: "#F7931A", // Orange for Bitcoin
      invested: "#10B981", // Green for success/profit
      grid: theme === "dark" ? "#333333" : "#e5e7eb",
      text: theme === "dark" ? "#ffffff" : "#0a0a0a",
      positive: "#F7931A", // Orange
      negative: "#EF4444", // Red
    })
  }, [theme, mounted])

  return chartColors
}
