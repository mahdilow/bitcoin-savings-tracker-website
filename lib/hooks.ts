"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useChartColors() {
  const { theme } = useTheme()
  const [chartColors, setChartColors] = useState({
    value: "hsl(var(--primary))",
    invested: "hsl(var(--chart-2))",
    grid: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    positive: "hsl(var(--primary))",
    negative: "hsl(var(--destructive))",
  })

  useEffect(() => {
    // This effect ensures that we get the colors after the theme has been applied.
    // It's a bit of a workaround for the fact that CSS variables are not immediately available.
    const timeoutId = setTimeout(() => {
      const style = getComputedStyle(document.documentElement)
      setChartColors({
        value: `hsl(${style.getPropertyValue("--primary").trim()})`,
        invested: `hsl(${style.getPropertyValue("--chart-2").trim()})`,
        grid: `hsl(${style.getPropertyValue("--border").trim()})`,
        text: `hsl(${style.getPropertyValue("--foreground").trim()})`,
        positive: `hsl(${style.getPropertyValue("--primary").trim()})`,
        negative: `hsl(${style.getPropertyValue("--destructive").trim()})`,
      })
    }, 1) // 1ms delay is enough to wait for the next paint

    return () => clearTimeout(timeoutId)
  }, [theme])

  return chartColors
}
