"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { formatJalaliInput, parseJalaliInput, jalaliToIso, gregorianToJalali } from "@/lib/jalali-utils"

interface JalaliDateInputProps {
  value: string // ISO date string
  onChange: (isoDate: string) => void
  className?: string
}

export function JalaliDateInput({ value, onChange, className }: JalaliDateInputProps) {
  const [jalaliValue, setJalaliValue] = useState("")

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      const { jy, jm, jd } = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
      setJalaliValue(formatJalaliInput(jy, jm, jd))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setJalaliValue(input)

    const parsed = parseJalaliInput(input)
    if (parsed) {
      const isoDate = jalaliToIso(parsed.jy, parsed.jm, parsed.jd)
      onChange(isoDate)
    }
  }

  return (
    <Input
      type="text"
      value={jalaliValue}
      onChange={handleChange}
      placeholder="1403/09/15"
      className={className}
      dir="ltr"
    />
  )
}
